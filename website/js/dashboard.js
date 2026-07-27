/* dashboard.js — Overview page charts & KPIs */

const D = MODEL_DATA;
const C = {
  red: '#e05c5c', amber: '#f0a443', green: '#3fb950',
  blue: '#58a6ff', purple: '#a371f7', muted: '#8b949e',
  bg3: '#1c232e', border: '#2a3441', text: '#e6edf3'
};
Chart.defaults.color = C.muted;
Chart.defaults.borderColor = C.border;
Chart.defaults.font.family = "'Inter', system-ui, sans-serif";

// ── KPI Cards ────────────────────────────────────────────────────────────
const kpis = [
  { label: 'Total Patients',    value: D.metrics.total_patients.toLocaleString(), sub: 'Synthetic cohort',      cls: 'kpi-blue'  },
  { label: 'Readmission Rate',  value: D.metrics.readmission_rate + '%',          sub: '30-day window',         cls: 'kpi-red'   },
  { label: 'High-Risk Flagged', value: D.metrics.high_risk_count.toLocaleString(), sub: 'Score > 60%',          cls: 'kpi-amber' },
  { label: 'Model AUC-ROC',     value: D.metrics.auc,                             sub: 'XGBoost + SMOTE',       cls: 'kpi-green' },
];

document.getElementById('kpiRow').innerHTML = kpis.map(k => `
  <div class="kpi-card">
    <div class="kpi-label">${k.label}</div>
    <div class="kpi-value ${k.cls}">${k.value}</div>
    <div class="kpi-sub">${k.sub}</div>
  </div>
`).join('');

// ── Risk Tier Donut ───────────────────────────────────────────────────────
const tiers = D.risk_tiers;
new Chart(document.getElementById('tierChart'), {
  type: 'doughnut',
  data: {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [{
      data: [tiers.Low || 0, tiers.Medium || 0, tiers.High || 0],
      backgroundColor: [C.green, C.amber, C.red],
      borderWidth: 0,
      hoverOffset: 8
    }]
  },
  options: {
    plugins: {
      legend: { position: 'bottom', labels: { padding: 18, boxWidth: 12 } }
    },
    cutout: '65%',
    maintainAspectRatio: false
  }
});

// ── Department Bar ────────────────────────────────────────────────────────
const depts = D.dept_rates;
new Chart(document.getElementById('deptChart'), {
  type: 'bar',
  data: {
    labels: depts.map(d => d.department),
    datasets: [{
      label: 'Readmission %',
      data: depts.map(d => d.rate),
      backgroundColor: depts.map(d =>
        d.rate > 40 ? C.red : d.rate > 30 ? C.amber : C.blue
      ),
      borderRadius: 5,
      borderSkipped: false
    }]
  },
  options: {
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: C.border }, ticks: { callback: v => v + '%' } },
      y: { grid: { display: false } }
    },
    maintainAspectRatio: false
  }
});

// ── ROC Curve ─────────────────────────────────────────────────────────────
const roc = D.roc;
new Chart(document.getElementById('rocChart'), {
  type: 'line',
  data: {
    datasets: [
      {
        label: `AUC = ${D.metrics.auc}`,
        data: roc.fpr.map((x,i) => ({ x, y: roc.tpr[i] })),
        borderColor: C.red,
        backgroundColor: 'rgba(224,92,92,0.12)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2.5
      },
      {
        label: 'Random Baseline',
        data: [{ x:0, y:0 }, { x:1, y:1 }],
        borderColor: C.muted,
        borderDash: [5,5],
        pointRadius: 0,
        borderWidth: 1.5,
        fill: false
      }
    ]
  },
  options: {
    parsing: false,
    plugins: { legend: { labels: { padding: 16, boxWidth: 14 } } },
    scales: {
      x: {
        type: 'linear',
        min: 0, max: 1,
        title: { display: true, text: 'False Positive Rate', color: C.muted },
        grid: { color: C.border }
      },
      y: {
        min: 0, max: 1,
        title: { display: true, text: 'True Positive Rate', color: C.muted },
        grid: { color: C.border }
      }
    },
    maintainAspectRatio: false
  }
});

// ── Feature Importance ────────────────────────────────────────────────────
const fi = D.feature_importance;
const fiLabels = fi.map(f => f.feature.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase()));
new Chart(document.getElementById('fiChart'), {
  type: 'bar',
  data: {
    labels: fiLabels,
    datasets: [{
      label: 'SHAP Value (mean |φ|)',
      data: fi.map(f => +f.importance.toFixed(4)),
      backgroundColor: fi.map((_, i) =>
        ['#e05c5c','#e8704a','#f0a443','#b8c547','#3fb950',
         '#3fc4c4','#58a6ff','#a371f7','#d06aff','#f075c8'][i] || C.blue
      ),
      borderRadius: 5,
      borderSkipped: false
    }]
  },
  options: {
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: C.border } },
      y: { grid: { display: false } }
    },
    maintainAspectRatio: false
  }
});

// ── Confusion Matrix ──────────────────────────────────────────────────────
const [tn, fp, fn, tp] = [
  D.metrics.cm[0][0], D.metrics.cm[0][1],
  D.metrics.cm[1][0], D.metrics.cm[1][1]
];
document.getElementById('cmWrap').innerHTML = `
  <div>
    <div style="display:flex; gap:4px; margin-bottom:4px; padding-left:64px;">
      <div class="cm-label-h">Predicted No</div>
      <div class="cm-label-h">Predicted Yes</div>
    </div>
    <div style="display:flex; gap:4px; margin-bottom:4px;">
      <div class="cm-label-v">Actual No</div>
      <div class="cm-cell cm-tn">${tn}</div>
      <div class="cm-cell cm-fp">${fp}</div>
    </div>
    <div style="display:flex; gap:4px;">
      <div class="cm-label-v">Actual Yes</div>
      <div class="cm-cell cm-fn">${fn}</div>
      <div class="cm-cell cm-tp">${tp}</div>
    </div>
    <div style="display:flex; gap:4px; margin-top:10px; padding-left:64px;">
      <div style="width:110px; text-align:center; font-size:0.7rem; color:#8b949e;">TN · True Neg</div>
      <div style="width:110px; text-align:center; font-size:0.7rem; color:#8b949e;">FP · False Pos</div>
    </div>
    <div style="display:flex; gap:4px; margin-top:4px; padding-left:64px;">
      <div style="width:110px; text-align:center; font-size:0.7rem; color:#8b949e;">FN · False Neg</div>
      <div style="width:110px; text-align:center; font-size:0.7rem; color:#8b949e;">TP · True Pos</div>
    </div>
  </div>
`;
