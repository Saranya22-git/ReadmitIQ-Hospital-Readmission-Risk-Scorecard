const MODEL_DATA = {
  "metrics": {
    "auc": 0.9554,
    "accuracy": 0.873,
    "precision": 1.0,
    "total_patients": 5000,
    "readmission_rate": 35.5,
    "high_risk_count": 341,
    "cm": [
      [
        572,
        73
      ],
      [
        54,
        301
      ]
    ]
  },
  "feature_importance": [
    {
      "feature": "age",
      "importance": 2.088881731033325
    },
    {
      "feature": "num_medications",
      "importance": 1.4410340785980225
    },
    {
      "feature": "length_of_stay",
      "importance": 1.415574550628662
    },
    {
      "feature": "num_prev_admissions",
      "importance": 1.2779908180236816
    },
    {
      "feature": "num_diagnoses",
      "importance": 1.155329704284668
    },
    {
      "feature": "discharge_disposition",
      "importance": 0.29801544547080994
    },
    {
      "feature": "heart_failure",
      "importance": 0.2965807318687439
    },
    {
      "feature": "copd",
      "importance": 0.21644167602062225
    },
    {
      "feature": "diabetes",
      "importance": 0.19163377583026886
    },
    {
      "feature": "gender",
      "importance": 0.1813945323228836
    }
  ],
  "roc": {
    "fpr": [
      0.0,
      0.0031,
      0.0062,
      0.0124,
      0.0171,
      0.0233,
      0.0264,
      0.0326,
      0.0372,
      0.0419,
      0.045,
      0.0496,
      0.0543,
      0.0605,
      0.0651,
      0.0713,
      0.076,
      0.0884,
      0.093,
      0.1023,
      0.1132,
      0.124,
      0.1318,
      0.1426,
      0.1504,
      0.1628,
      0.1674,
      0.1876,
      0.1938,
      0.2078,
      0.214,
      0.2558,
      0.2698,
      0.3039,
      0.4372
    ],
    "tpr": [
      0.0,
      0.3634,
      0.4507,
      0.493,
      0.5352,
      0.5746,
      0.6056,
      0.6761,
      0.6986,
      0.7127,
      0.7296,
      0.7408,
      0.7577,
      0.7662,
      0.7944,
      0.8028,
      0.8169,
      0.8225,
      0.8338,
      0.8423,
      0.8507,
      0.8563,
      0.8648,
      0.8789,
      0.8986,
      0.9042,
      0.9268,
      0.9352,
      0.9465,
      0.9521,
      0.9662,
      0.9718,
      0.9831,
      0.9887,
      0.9972
    ]
  },
  "dept_rates": [
    {
      "department": "Cardiology",
      "rate": 36.9,
      "patients": 999
    },
    {
      "department": "General Medicine",
      "rate": 35.2,
      "patients": 1014
    },
    {
      "department": "Neurology",
      "rate": 35.5,
      "patients": 1000
    },
    {
      "department": "Orthopedics",
      "rate": 35.4,
      "patients": 998
    },
    {
      "department": "Pulmonology",
      "rate": 34.7,
      "patients": 989
    }
  ],
  "risk_tiers": {
    "Low": 544,
    "Medium": 115,
    "High": 341
  },
  "le_maps": {
    "gender": {
      "Female": 0,
      "Male": 1
    },
    "discharge_disposition": {
      "AMA": 0,
      "Home": 1,
      "Home Health": 2,
      "Rehab": 3,
      "SNF": 4
    },
    "insurance_type": {
      "Medicaid": 0,
      "Medicare": 1,
      "Private": 2,
      "Self-Pay": 3
    },
    "department": {
      "Cardiology": 0,
      "General Medicine": 1,
      "Neurology": 2,
      "Orthopedics": 3,
      "Pulmonology": 4
    }
  },
  "feature_cols": [
    "age",
    "gender",
    "length_of_stay",
    "num_prev_admissions",
    "num_diagnoses",
    "num_procedures",
    "num_medications",
    "diabetes",
    "hypertension",
    "heart_failure",
    "copd",
    "discharge_disposition",
    "insurance_type",
    "department"
  ]
};