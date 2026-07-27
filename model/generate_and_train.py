"""
Hospital Readmission Risk Scorecard
Generates synthetic data, trains XGBoost with SMOTE, exports model artifacts.
"""

import pandas as pd
import numpy as np
import json, pickle, os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (classification_report, roc_auc_score,
                             confusion_matrix, roc_curve)
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE

np.random.seed(42)
N = 5000

# ── Synthetic Data Generation ──────────────────────────────────────────────
age        = np.random.randint(18, 90, N)
gender     = np.random.choice(['Male', 'Female'], N)
los        = np.random.randint(1, 30, N)          # length of stay (days)
num_prev   = np.random.randint(0, 10, N)          # prior admissions in 12 mo
num_diag   = np.random.randint(1, 15, N)          # number of diagnoses
num_proc   = np.random.randint(0, 10, N)          # procedures done
num_meds   = np.random.randint(1, 25, N)          # medications at discharge
has_dm     = np.random.choice([0,1], N, p=[0.6,0.4])
has_htn    = np.random.choice([0,1], N, p=[0.55,0.45])
has_chf    = np.random.choice([0,1], N, p=[0.75,0.25])
has_copd   = np.random.choice([0,1], N, p=[0.80,0.20])
discharge  = np.random.choice(['Home','Home Health','SNF','Rehab','AMA'], N,
                               p=[0.45,0.25,0.15,0.10,0.05])
insurance  = np.random.choice(['Medicare','Medicaid','Private','Self-Pay'], N,
                               p=[0.40,0.25,0.25,0.10])
dept       = np.random.choice(['Cardiology','General Medicine','Pulmonology',
                                'Orthopedics','Neurology'], N)

# Realistic readmission probability
logit = (
    -3.5
    + 0.03 * age
    + 0.12 * num_prev
    + 0.08 * num_diag
    + 0.06 * num_meds
    - 0.05 * los
    + 0.35 * has_chf
    + 0.25 * has_copd
    + 0.20 * has_dm
    + 0.15 * has_htn
    + np.where(discharge == 'AMA', 0.8, 0)
    + np.where(discharge == 'SNF', 0.2, 0)
    + np.where(insurance == 'Self-Pay', 0.3, 0)
    + np.random.normal(0, 0.3, N)
)
prob = 1 / (1 + np.exp(-logit))
readmitted = (prob > 0.5).astype(int)

df = pd.DataFrame({
    'age': age, 'gender': gender, 'length_of_stay': los,
    'num_prev_admissions': num_prev, 'num_diagnoses': num_diag,
    'num_procedures': num_proc, 'num_medications': num_meds,
    'diabetes': has_dm, 'hypertension': has_htn,
    'heart_failure': has_chf, 'copd': has_copd,
    'discharge_disposition': discharge, 'insurance_type': insurance,
    'department': dept, 'readmitted_30d': readmitted
})

os.makedirs('../data', exist_ok=True)
df.to_csv('../data/hospital_readmission.csv', index=False)
print(f"Dataset: {df.shape}  |  Readmission rate: {readmitted.mean():.1%}")

# ── Preprocessing ──────────────────────────────────────────────────────────
le_cols = ['gender', 'discharge_disposition', 'insurance_type', 'department']
le_maps = {}
for col in le_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    le_maps[col] = dict(zip(le.classes_, le.transform(le.classes_).tolist()))

feature_cols = [c for c in df.columns if c != 'readmitted_30d']
X = df[feature_cols]
y = df['readmitted_30d']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2,
                                                      random_state=42,
                                                      stratify=y)

sm = SMOTE(random_state=42)
X_res, y_res = sm.fit_resample(X_train, y_train)
print(f"After SMOTE — 0: {(y_res==0).sum()}  1: {(y_res==1).sum()}")

# ── Train XGBoost ──────────────────────────────────────────────────────────
model = XGBClassifier(
    n_estimators=300, max_depth=5, learning_rate=0.05,
    subsample=0.8, colsample_bytree=0.8,
    use_label_encoder=False, eval_metric='logloss',
    random_state=42
)
model.fit(X_res, y_res,
          eval_set=[(X_test, y_test)],
          verbose=False)

y_pred  = model.predict(X_test)
y_proba = model.predict_proba(X_test)[:,1]
auc     = roc_auc_score(y_test, y_proba)
print(f"\nAUC-ROC : {auc:.4f}")
print(classification_report(y_test, y_pred))

# ── SHAP Feature Importance ────────────────────────────────────────────────
import shap
explainer   = shap.TreeExplainer(model)
shap_vals   = explainer.shap_values(X_test[:200])
mean_abs    = np.abs(shap_vals).mean(axis=0)
fi_df = pd.DataFrame({'feature': feature_cols, 'importance': mean_abs})
fi_df = fi_df.sort_values('importance', ascending=False)

# ── ROC Curve Data ─────────────────────────────────────────────────────────
fpr, tpr, _ = roc_curve(y_test, y_proba)

# ── Confusion Matrix ───────────────────────────────────────────────────────
cm = confusion_matrix(y_test, y_pred).tolist()

# ── Department-level readmission rates ────────────────────────────────────
dept_map_rev = {v:k for k,v in le_maps['department'].items()}
df_orig = pd.read_csv('../data/hospital_readmission.csv')
dept_rates = (df_orig.groupby('department')['readmitted_30d']
              .agg(['mean','count'])
              .reset_index()
              .rename(columns={'mean':'rate','count':'patients'}))
dept_rates['rate'] = (dept_rates['rate']*100).round(1)

# Risk tier distribution
risk_tiers = pd.cut(y_proba, bins=[0,0.3,0.6,1.0],
                    labels=['Low','Medium','High'])
tier_counts = risk_tiers.value_counts().to_dict()

# ── Export all artifacts ───────────────────────────────────────────────────
os.makedirs('../website/js', exist_ok=True)

artifacts = {
    "metrics": {
        "auc": round(auc, 4),
        "accuracy": round((y_pred == y_test.values).mean(), 4),
        "precision": round(float(
            y_pred[y_pred==1].shape[0] /
            max(y_pred.sum(),1) if y_pred.sum() else 0), 4),
        "total_patients": int(N),
        "readmission_rate": round(float(readmitted.mean()*100), 1),
        "high_risk_count": int(tier_counts.get('High', 0)),
        "cm": cm
    },
    "feature_importance": fi_df.head(10).to_dict(orient='records'),
    "roc": {
        "fpr": [round(float(x),4) for x in fpr[::5]],
        "tpr": [round(float(x),4) for x in tpr[::5]]
    },
    "dept_rates": dept_rates.to_dict(orient='records'),
    "risk_tiers": {k: int(v) for k,v in tier_counts.items()},
    "le_maps": le_maps,
    "feature_cols": feature_cols
}

with open('../website/js/model_data.js', 'w') as f:
    f.write(f"const MODEL_DATA = {json.dumps(artifacts, indent=2)};")

# Save model
with open('../model/xgb_readmission.pkl', 'wb') as f:
    pickle.dump(model, f)

print("\n✅ model_data.js and xgb_readmission.pkl saved.")
print("\nTop 10 Features (SHAP):")
print(fi_df.head(10).to_string(index=False))
