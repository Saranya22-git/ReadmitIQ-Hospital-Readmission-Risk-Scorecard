const EDA_DATA = {
  "overall": {
    "total": 5000,
    "readmitted": 1777,
    "not_readmitted": 3223,
    "readmit_rate": 35.5,
    "avg_age": 53.3,
    "avg_los": 15.3,
    "avg_meds": 12.5,
    "avg_diag": 7.4
  },
  "age_dist": {
    "18-30": 831,
    "31-40": 718,
    "41-50": 698,
    "51-60": 685,
    "61-70": 687,
    "71-80": 731,
    "81-90": 581
  },
  "age_read": {
    "18-30": 7.5,
    "31-40": 15.7,
    "41-50": 22.5,
    "51-60": 32.4,
    "61-70": 46.6,
    "71-80": 65.3,
    "81-90": 73.0
  },
  "los_dist": {
    "1-5": 830,
    "6-10": 819,
    "11-15": 864,
    "16-20": 886,
    "21-30": 1601
  },
  "meds_dist": {
    "1-5": 1066,
    "6-10": 1009,
    "11-15": 1058,
    "16+": 1867
  },
  "dept_read": [
    {
      "department": "Cardiology",
      "rate": 36.9,
      "count": 999
    },
    {
      "department": "General Medicine",
      "rate": 35.2,
      "count": 1014
    },
    {
      "department": "Neurology",
      "rate": 35.5,
      "count": 1000
    },
    {
      "department": "Orthopedics",
      "rate": 35.4,
      "count": 998
    },
    {
      "department": "Pulmonology",
      "rate": 34.7,
      "count": 989
    }
  ],
  "ins_read": [
    {
      "insurance_type": "Medicaid",
      "rate": 34.2,
      "count": 1276
    },
    {
      "insurance_type": "Medicare",
      "rate": 34.6,
      "count": 1956
    },
    {
      "insurance_type": "Private",
      "rate": 33.1,
      "count": 1278
    },
    {
      "insurance_type": "Self-Pay",
      "rate": 49.2,
      "count": 490
    }
  ],
  "disc_read": [
    {
      "discharge_disposition": "AMA",
      "rate": 56.3,
      "count": 247
    },
    {
      "discharge_disposition": "Home",
      "rate": 33.1,
      "count": 2199
    },
    {
      "discharge_disposition": "Home Health",
      "rate": 33.4,
      "count": 1281
    },
    {
      "discharge_disposition": "Rehab",
      "rate": 31.2,
      "count": 496
    },
    {
      "discharge_disposition": "SNF",
      "rate": 42.1,
      "count": 777
    }
  ],
  "comorb": {
    "Diabetes": 41.5,
    "Hypertension": 44.3,
    "Heart Failure": 24.4,
    "COPD": 21.0
  },
  "gender_read": {
    "Female": 34.3,
    "Male": 36.8
  }
};