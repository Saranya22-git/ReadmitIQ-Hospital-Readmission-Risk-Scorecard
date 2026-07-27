-- ============================================================
-- Hospital Readmission Risk Scorecard — SQL Analysis Queries
-- Dataset: hospital_readmission.csv (5,000 patient records)
-- Author : Saranya Sammeta
-- ============================================================

-- TABLE SCHEMA (for reference):
-- CREATE TABLE hospital_readmission (
--   age                   INT,
--   gender                VARCHAR(10),
--   length_of_stay        INT,
--   num_prev_admissions   INT,
--   num_diagnoses         INT,
--   num_procedures        INT,
--   num_medications       INT,
--   diabetes              INT,       -- 0 or 1
--   hypertension          INT,       -- 0 or 1
--   heart_failure         INT,       -- 0 or 1
--   copd                  INT,       -- 0 or 1
--   discharge_disposition VARCHAR(20),
--   insurance_type        VARCHAR(20),
--   department            VARCHAR(30),
--   readmitted_30d        INT        -- 0 or 1
-- );


-- ============================================================
-- Q1. Overall Readmission Rate
-- Business Use: Baseline KPI for hospital dashboard
-- ============================================================
SELECT
    COUNT(*)                                           AS total_patients,
    SUM(readmitted_30d)                                AS total_readmitted,
    ROUND(AVG(readmitted_30d) * 100, 2)               AS readmission_rate_pct
FROM hospital_readmission;


-- ============================================================
-- Q2. Readmission Rate by Department (Ranked)
-- Business Use: Identify which departments need intervention
-- ============================================================
SELECT
    department,
    COUNT(*)                                           AS total_patients,
    SUM(readmitted_30d)                                AS readmitted,
    ROUND(AVG(readmitted_30d) * 100, 2)               AS readmission_rate_pct
FROM hospital_readmission
GROUP BY department
ORDER BY readmission_rate_pct DESC;


-- ============================================================
-- Q3. Average Length of Stay by Readmission Status
-- Business Use: Understand if longer stays prevent readmission
-- ============================================================
SELECT
    CASE WHEN readmitted_30d = 1 THEN 'Readmitted' ELSE 'Not Readmitted' END AS status,
    COUNT(*)                                           AS patient_count,
    ROUND(AVG(length_of_stay), 2)                      AS avg_length_of_stay,
    ROUND(AVG(num_medications), 2)                     AS avg_medications,
    ROUND(AVG(num_diagnoses), 2)                       AS avg_diagnoses
FROM hospital_readmission
GROUP BY readmitted_30d;


-- ============================================================
-- Q4. High-Risk Patients — Multi-Condition Flag
-- Business Use: Flag patients needing immediate care coordination
-- ============================================================
SELECT
    age,
    gender,
    department,
    insurance_type,
    discharge_disposition,
    num_prev_admissions,
    num_medications,
    length_of_stay,
    (diabetes + hypertension + heart_failure + copd)   AS comorbidity_count,
    readmitted_30d
FROM hospital_readmission
WHERE
    num_prev_admissions >= 3
    AND (diabetes + hypertension + heart_failure + copd) >= 2
    AND num_medications >= 10
ORDER BY comorbidity_count DESC, num_prev_admissions DESC
LIMIT 50;


-- ============================================================
-- Q5. Readmission Rate by Insurance Type
-- Business Use: Identify financial risk segments
-- ============================================================
SELECT
    insurance_type,
    COUNT(*)                                           AS total_patients,
    SUM(readmitted_30d)                                AS readmitted,
    ROUND(AVG(readmitted_30d) * 100, 2)               AS readmission_rate_pct,
    ROUND(AVG(num_medications), 1)                     AS avg_medications,
    ROUND(AVG(length_of_stay), 1)                      AS avg_los
FROM hospital_readmission
GROUP BY insurance_type
ORDER BY readmission_rate_pct DESC;


-- ============================================================
-- Q6. Readmission Rate by Discharge Disposition
-- Business Use: Evaluate discharge planning effectiveness
-- ============================================================
SELECT
    discharge_disposition,
    COUNT(*)                                           AS total_patients,
    SUM(readmitted_30d)                                AS readmitted,
    ROUND(AVG(readmitted_30d) * 100, 2)               AS readmission_rate_pct,
    ROUND(AVG(age), 1)                                 AS avg_age
FROM hospital_readmission
GROUP BY discharge_disposition
ORDER BY readmission_rate_pct DESC;


-- ============================================================
-- Q7. Age-Band Readmission Analysis
-- Business Use: Target age-specific intervention programs
-- ============================================================
SELECT
    CASE
        WHEN age BETWEEN 18 AND 30 THEN '18–30'
        WHEN age BETWEEN 31 AND 40 THEN '31–40'
        WHEN age BETWEEN 41 AND 50 THEN '41–50'
        WHEN age BETWEEN 51 AND 60 THEN '51–60'
        WHEN age BETWEEN 61 AND 70 THEN '61–70'
        WHEN age BETWEEN 71 AND 80 THEN '71–80'
        ELSE '81+'
    END                                                AS age_band,
    COUNT(*)                                           AS total_patients,
    SUM(readmitted_30d)                                AS readmitted,
    ROUND(AVG(readmitted_30d) * 100, 2)               AS readmission_rate_pct,
    ROUND(AVG(num_prev_admissions), 1)                 AS avg_prior_admissions
FROM hospital_readmission
GROUP BY age_band
ORDER BY MIN(age);


-- ============================================================
-- Q8. Comorbidity Combinations and Readmission Risk
-- Business Use: Understand which disease combinations are riskiest
-- ============================================================
SELECT
    diabetes,
    hypertension,
    heart_failure,
    copd,
    COUNT(*)                                           AS patient_count,
    SUM(readmitted_30d)                                AS readmitted,
    ROUND(AVG(readmitted_30d) * 100, 2)               AS readmission_rate_pct
FROM hospital_readmission
GROUP BY diabetes, hypertension, heart_failure, copd
HAVING COUNT(*) >= 20
ORDER BY readmission_rate_pct DESC
LIMIT 15;


-- ============================================================
-- Q9. Top 10 Departments + Insurance Combination Analysis
-- Business Use: Find highest-risk patient segments for targeting
-- ============================================================
SELECT
    department,
    insurance_type,
    COUNT(*)                                           AS patient_count,
    ROUND(AVG(readmitted_30d) * 100, 2)               AS readmission_rate_pct,
    ROUND(AVG(num_medications), 1)                     AS avg_medications
FROM hospital_readmission
GROUP BY department, insurance_type
HAVING COUNT(*) >= 30
ORDER BY readmission_rate_pct DESC
LIMIT 10;


-- ============================================================
-- Q10. Window Function — Running Readmission Rate by Age
-- Business Use: Trend analysis for clinical reporting
-- ============================================================
WITH age_summary AS (
    SELECT
        age,
        COUNT(*)                    AS patients,
        SUM(readmitted_30d)         AS readmitted
    FROM hospital_readmission
    GROUP BY age
)
SELECT
    age,
    patients,
    readmitted,
    ROUND(readmitted * 100.0 / patients, 1)        AS readmission_rate_pct,
    SUM(readmitted) OVER (ORDER BY age)             AS cumulative_readmitted,
    SUM(patients)   OVER (ORDER BY age)             AS cumulative_patients,
    ROUND(
        SUM(readmitted) OVER (ORDER BY age) * 100.0 /
        SUM(patients)   OVER (ORDER BY age), 2
    )                                               AS running_readmission_rate
FROM age_summary
ORDER BY age;


-- ============================================================
-- Q11. Polypharmacy Risk Segment (16+ Medications)
-- Business Use: Flag patients for medication review at discharge
-- ============================================================
SELECT
    CASE
        WHEN num_medications BETWEEN 1 AND 5   THEN '1–5 meds'
        WHEN num_medications BETWEEN 6 AND 10  THEN '6–10 meds'
        WHEN num_medications BETWEEN 11 AND 15 THEN '11–15 meds'
        ELSE '16+ meds (Polypharmacy)'
    END                                                AS medication_tier,
    COUNT(*)                                           AS patient_count,
    ROUND(AVG(readmitted_30d) * 100, 2)               AS readmission_rate_pct,
    ROUND(AVG(age), 1)                                 AS avg_age,
    ROUND(AVG(num_diagnoses), 1)                       AS avg_diagnoses
FROM hospital_readmission
GROUP BY medication_tier
ORDER BY MIN(num_medications);


-- ============================================================
-- Q12. Patients with AMA Discharge — High Risk Segment
-- Business Use: Prioritize outreach for against-advice discharges
-- ============================================================
SELECT
    discharge_disposition,
    gender,
    department,
    insurance_type,
    ROUND(AVG(age), 1)                                 AS avg_age,
    COUNT(*)                                           AS patient_count,
    ROUND(AVG(readmitted_30d) * 100, 2)               AS readmission_rate_pct,
    ROUND(AVG(num_prev_admissions), 1)                 AS avg_prior_admissions
FROM hospital_readmission
WHERE discharge_disposition = 'AMA'
GROUP BY gender, department, insurance_type, discharge_disposition
ORDER BY readmission_rate_pct DESC;
