import type { HealthStoreState, BiomarkerStatus } from '../types';

export function computeBiomarkerStatus(value: number, minRef: number, maxRef: number): BiomarkerStatus {
  if (value < minRef) return 'low';
  if (value > maxRef) return 'high';
  return 'normal';
}

export const DEMO_ACCOUNTS = {
  patient: {
    role: 'patient' as const,
    userId: 'acc_aarav',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@vitalsense.health',
    subtitle: 'Primary Account',
  },
  doctor: {
    role: 'doctor' as const,
    userId: 'doc_kavita',
    name: 'Dr. Kavita Rao, MD',
    email: 'kavita.rao@metrohealth.org',
    subtitle: 'Internal Medicine · Metro Health',
  },
};

export const SAMPLE_LAB_REPORTS = [
  {
    id: 'sample_metabolic_panel',
    title: 'Metropolis Comprehensive Metabolic & Vitamin Panel',
    subtitle: 'Includes 2 flagged OCR values for Review Data verification',
    labName: 'Metropolis Diagnostics',
    reportDate: '2026-11-10',
    rawText: `METROPOLIS DIAGNOSTICS - PATIENT LAB REPORT
Patient: Aarav Sharma | Collected: 2026-11-10
---------------------------------------------------
HbA1c (Glycated Hemoglobin) : 6.4 %       [Ref: 4.0 - 5.6 %]
Vitamin D (25-OH Total)     : 21.8 ?      [Ref: 30.0 - 100.0 ng/mL]  (Note: smudge near unit)
Serum Iron                  : 58 ug/dL    [Ref: 65 - 175 ug/dL]
TSH (Thyroid Stimulating)   : 2.34 mIU/L  [Ref: 0.40 - 4.20 mIU/L]
LDL Cholesterol             : 118 mg/dL   [Ref: 0 - 100 mg/dL]
Ferritin                    : ~62 ng/mL   [Ref: 30 - 300 ng/mL]       (Note: faint print / approximate digit)
Hemoglobin                  : 14.4 g/dL   [Ref: 13.5 - 17.5 g/dL]`,
  },
  {
    id: 'sample_thyroid_lipid',
    title: 'Lal PathLabs Follow-Up Thyroid & Lipid Check',
    subtitle: 'Includes 1 uncertain handwritten value',
    labName: 'Dr. Lal PathLabs',
    reportDate: '2026-11-12',
    rawText: `DR. LAL PATHLABS - CLINICAL BIOCHEMISTRY
Date: 2026-11-12
HbA1c                       : 6.1 %       [Ref: 4.0 - 5.6 %]
Vitamin D (25-OH)           : 29.4 ng/mL  [Ref: 30.0 - 100.0 ng/mL]
TSH                         : 3.10? mIU/L [Ref: 0.40 - 4.20 mIU/L] (Note: handwritten correction on decimal)
LDL Cholesterol             : 104 mg/dL   [Ref: 0 - 100 mg/dL]
Vitamin B12                 : 412 pg/mL   [Ref: 211 - 911 pg/mL]`,
  },
];

export const INITIAL_HEALTH_STATE: HealthStoreState = {
  session: null,
  activeProfileId: 'prof_aarav',
  profiles: [
    {
      id: 'prof_aarav',
      ownerAccountId: 'acc_aarav',
      name: 'Aarav Sharma',
      relation: 'Primary User',
      age: 34,
      gender: 'Male',
      bloodGroup: 'O+',
      email: 'aarav.sharma@vitalsense.health',
      phone: '+91 98204 51120',
      abhaId: '91-4829-1034-7721',
      abhaLinkedAt: '2026-06-14',
      reports: [
        {
          id: 'rep_aarav_1',
          labName: 'Apollo Diagnostics',
          reportDate: '2025-11-18',
          uploadedAt: '2025-11-19T09:10:00Z',
          readings: [
            { id: 'r_a1_1', key: 'hba1c', name: 'HbA1c', value: 5.9, unit: '%', minRef: 4.0, maxRef: 5.6, date: '2025-11-18', status: 'high', verification: 'auto_confirmed' },
            { id: 'r_a1_2', key: 'vitamin_d', name: 'Vitamin D (25-OH)', value: 18.2, unit: 'ng/mL', minRef: 30, maxRef: 100, date: '2025-11-18', status: 'low', verification: 'auto_confirmed' },
            { id: 'r_a1_3', key: 'iron', name: 'Serum Iron', value: 78, unit: 'µg/dL', minRef: 65, maxRef: 175, date: '2025-11-18', status: 'normal', verification: 'auto_confirmed' },
            { id: 'r_a1_4', key: 'tsh', name: 'TSH', value: 2.15, unit: 'mIU/L', minRef: 0.4, maxRef: 4.2, date: '2025-11-18', status: 'normal', verification: 'auto_confirmed' },
            { id: 'r_a1_5', key: 'ldl', name: 'LDL Cholesterol', value: 132, unit: 'mg/dL', minRef: 0, maxRef: 100, date: '2025-11-18', status: 'high', verification: 'auto_confirmed' },
          ],
        },
        {
          id: 'rep_aarav_2',
          labName: 'Metropolis Diagnostics',
          reportDate: '2026-02-22',
          uploadedAt: '2026-02-22T14:25:00Z',
          readings: [
            { id: 'r_a2_1', key: 'hba1c', name: 'HbA1c', value: 6.2, unit: '%', minRef: 4.0, maxRef: 5.6, date: '2026-02-22', status: 'high', verification: 'auto_confirmed' },
            { id: 'r_a2_2', key: 'vitamin_d', name: 'Vitamin D (25-OH)', value: 22.4, unit: 'ng/mL', minRef: 30, maxRef: 100, date: '2026-02-22', status: 'low', verification: 'manual_verified' },
            { id: 'r_a2_3', key: 'iron', name: 'Serum Iron', value: 62, unit: 'µg/dL', minRef: 65, maxRef: 175, date: '2026-02-22', status: 'low', verification: 'auto_confirmed' },
            { id: 'r_a2_4', key: 'tsh', name: 'TSH', value: 2.42, unit: 'mIU/L', minRef: 0.4, maxRef: 4.2, date: '2026-02-22', status: 'normal', verification: 'auto_confirmed' },
            { id: 'r_a2_5', key: 'ldl', name: 'LDL Cholesterol', value: 124, unit: 'mg/dL', minRef: 0, maxRef: 100, date: '2026-02-22', status: 'high', verification: 'auto_confirmed' },
          ],
        },
        {
          id: 'rep_aarav_3',
          labName: 'Dr. Lal PathLabs',
          reportDate: '2026-06-15',
          uploadedAt: '2026-06-15T11:05:00Z',
          readings: [
            { id: 'r_a3_1', key: 'hba1c', name: 'HbA1c', value: 6.3, unit: '%', minRef: 4.0, maxRef: 5.6, date: '2026-06-15', status: 'high', verification: 'auto_confirmed' },
            { id: 'r_a3_2', key: 'vitamin_d', name: 'Vitamin D (25-OH)', value: 25.1, unit: 'ng/mL', minRef: 30, maxRef: 100, date: '2026-06-15', status: 'low', verification: 'auto_confirmed' },
            { id: 'r_a3_3', key: 'iron', name: 'Serum Iron', value: 69, unit: 'µg/dL', minRef: 65, maxRef: 175, date: '2026-06-15', status: 'normal', verification: 'auto_confirmed' },
            { id: 'r_a3_4', key: 'tsh', name: 'TSH', value: 2.28, unit: 'mIU/L', minRef: 0.4, maxRef: 4.2, date: '2026-06-15', status: 'normal', verification: 'auto_confirmed' },
            { id: 'r_a3_5', key: 'ldl', name: 'LDL Cholesterol', value: 115, unit: 'mg/dL', minRef: 0, maxRef: 100, date: '2026-06-15', status: 'high', verification: 'auto_confirmed' },
          ],
        },
        {
          id: 'rep_aarav_4',
          labName: 'Metropolis Diagnostics',
          reportDate: '2026-09-28',
          uploadedAt: '2026-09-28T16:40:00Z',
          readings: [
            { id: 'r_a4_1', key: 'hba1c', name: 'HbA1c', value: 6.1, unit: '%', minRef: 4.0, maxRef: 5.6, date: '2026-09-28', status: 'high', verification: 'auto_confirmed' },
            { id: 'r_a4_2', key: 'vitamin_d', name: 'Vitamin D (25-OH)', value: 24.6, unit: 'ng/mL', minRef: 30, maxRef: 100, date: '2026-09-28', status: 'low', verification: 'auto_confirmed' },
            { id: 'r_a4_3', key: 'iron', name: 'Serum Iron', value: 57, unit: 'µg/dL', minRef: 65, maxRef: 175, date: '2026-09-28', status: 'low', verification: 'manual_verified' },
            { id: 'r_a4_4', key: 'tsh', name: 'TSH', value: 2.19, unit: 'mIU/L', minRef: 0.4, maxRef: 4.2, date: '2026-09-28', status: 'normal', verification: 'auto_confirmed' },
            { id: 'r_a4_5', key: 'ldl', name: 'LDL Cholesterol', value: 112, unit: 'mg/dL', minRef: 0, maxRef: 100, date: '2026-09-28', status: 'high', verification: 'auto_confirmed' },
          ],
        },
      ],
    },
    {
      id: 'prof_meera',
      ownerAccountId: 'acc_aarav',
      name: 'Meera Sharma',
      relation: 'Mother (Dependent)',
      age: 62,
      gender: 'Female',
      bloodGroup: 'B+',
      email: 'meera.sharma@vitalsense.health',
      phone: '+91 98204 51121',
      abhaId: '91-7312-8840-1923',
      abhaLinkedAt: '2026-07-02',
      reports: [
        {
          id: 'rep_meera_1',
          labName: 'Max Super Specialty Lab',
          reportDate: '2026-03-10',
          uploadedAt: '2026-03-10T10:15:00Z',
          readings: [
            { id: 'r_m1_1', key: 'tsh', name: 'TSH', value: 5.4, unit: 'mIU/L', minRef: 0.4, maxRef: 4.2, date: '2026-03-10', status: 'high', verification: 'auto_confirmed' },
            { id: 'r_m1_2', key: 'vitamin_b12', name: 'Vitamin B12', value: 185, unit: 'pg/mL', minRef: 211, maxRef: 911, date: '2026-03-10', status: 'low', verification: 'auto_confirmed' },
            { id: 'r_m1_3', key: 'hba1c', name: 'HbA1c', value: 5.5, unit: '%', minRef: 4.0, maxRef: 5.6, date: '2026-03-10', status: 'normal', verification: 'auto_confirmed' },
          ],
        },
        {
          id: 'rep_meera_2',
          labName: 'Max Super Specialty Lab',
          reportDate: '2026-09-12',
          uploadedAt: '2026-09-12T12:00:00Z',
          readings: [
            { id: 'r_m2_1', key: 'tsh', name: 'TSH', value: 4.85, unit: 'mIU/L', minRef: 0.4, maxRef: 4.2, date: '2026-09-12', status: 'high', verification: 'auto_confirmed' },
            { id: 'r_m2_2', key: 'vitamin_b12', name: 'Vitamin B12', value: 238, unit: 'pg/mL', minRef: 211, maxRef: 911, date: '2026-09-12', status: 'normal', verification: 'auto_confirmed' },
            { id: 'r_m2_3', key: 'hba1c', name: 'HbA1c', value: 5.4, unit: '%', minRef: 4.0, maxRef: 5.6, date: '2026-09-12', status: 'normal', verification: 'auto_confirmed' },
          ],
        },
      ],
    },
    {
      id: 'prof_priya',
      ownerAccountId: 'acc_priya',
      name: 'Priya Nair',
      relation: 'External Patient',
      age: 39,
      gender: 'Female',
      bloodGroup: 'A+',
      email: 'priya.nair@example.org',
      phone: '+91 98112 30498',
      reports: [
        {
          id: 'rep_priya_1',
          labName: 'Fortis Central Lab',
          reportDate: '2026-04-04',
          uploadedAt: '2026-04-04T08:45:00Z',
          readings: [
            { id: 'r_p1_1', key: 'ferritin', name: 'Ferritin', value: 18, unit: 'ng/mL', minRef: 30, maxRef: 300, date: '2026-04-04', status: 'low', verification: 'auto_confirmed' },
            { id: 'r_p1_2', key: 'hemoglobin', name: 'Hemoglobin', value: 10.9, unit: 'g/dL', minRef: 12.0, maxRef: 15.5, date: '2026-04-04', status: 'low', verification: 'auto_confirmed' },
            { id: 'r_p1_3', key: 'vitamin_d', name: 'Vitamin D (25-OH)', value: 38.0, unit: 'ng/mL', minRef: 30, maxRef: 100, date: '2026-04-04', status: 'normal', verification: 'auto_confirmed' },
          ],
        },
        {
          id: 'rep_priya_2',
          labName: 'Fortis Central Lab',
          reportDate: '2026-10-05',
          uploadedAt: '2026-10-05T09:30:00Z',
          readings: [
            { id: 'r_p2_1', key: 'ferritin', name: 'Ferritin', value: 24, unit: 'ng/mL', minRef: 30, maxRef: 300, date: '2026-10-05', status: 'low', verification: 'auto_confirmed' },
            { id: 'r_p2_2', key: 'hemoglobin', name: 'Hemoglobin', value: 11.4, unit: 'g/dL', minRef: 12.0, maxRef: 15.5, date: '2026-10-05', status: 'low', verification: 'auto_confirmed' },
            { id: 'r_p2_3', key: 'vitamin_d', name: 'Vitamin D (25-OH)', value: 41.2, unit: 'ng/mL', minRef: 30, maxRef: 100, date: '2026-10-05', status: 'normal', verification: 'auto_confirmed' },
          ],
        },
      ],
    },
  ],
  consentLinks: [
    {
      id: 'c_1',
      profileId: 'prof_aarav',
      doctorId: 'doc_kavita',
      doctorName: 'Dr. Kavita Rao, MD',
      specialty: 'Internal Medicine',
      clinic: 'Metro Health Clinic',
      shareCode: 'VS-KR-8921',
      createdAt: '2026-09-29',
      expiresAt: '2026-12-29',
      status: 'active',
    },
    {
      id: 'c_2',
      profileId: 'prof_aarav',
      doctorId: 'doc_arjun',
      doctorName: 'Dr. Arjun Mehta',
      specialty: 'Endocrinology',
      clinic: 'Apex Care Center',
      shareCode: 'VS-AM-4410',
      createdAt: '2026-08-14',
      expiresAt: '2026-11-30',
      status: 'active',
    },
    {
      id: 'c_3',
      profileId: 'prof_meera',
      doctorId: 'doc_kavita',
      doctorName: 'Dr. Kavita Rao, MD',
      specialty: 'Internal Medicine',
      clinic: 'Metro Health Clinic',
      shareCode: 'VS-KR-5504',
      createdAt: '2026-09-14',
      expiresAt: '2026-12-14',
      status: 'active',
    },
    {
      id: 'c_4',
      profileId: 'prof_priya',
      doctorId: 'doc_kavita',
      doctorName: 'Dr. Kavita Rao, MD',
      specialty: 'Internal Medicine',
      clinic: 'Metro Health Clinic',
      shareCode: 'VS-KR-1178',
      createdAt: '2026-10-06',
      expiresAt: '2027-01-06',
      status: 'active',
    },
  ],
  auditLogs: [
    {
      id: 'aud_1',
      profileId: 'prof_aarav',
      profileName: 'Aarav Sharma',
      doctorId: 'doc_kavita',
      doctorName: 'Dr. Kavita Rao, MD',
      action: 'Viewed Out-of-Bounds Summary & HbA1c Trend',
      accessedAt: '2026-10-12T10:24:00Z',
    },
    {
      id: 'aud_2',
      profileId: 'prof_aarav',
      profileName: 'Aarav Sharma',
      doctorId: 'doc_arjun',
      doctorName: 'Dr. Arjun Mehta',
      action: 'Reviewed September 2026 Metabolic Panel',
      accessedAt: '2026-10-02T15:48:00Z',
    },
    {
      id: 'aud_3',
      profileId: 'prof_meera',
      profileName: 'Meera Sharma',
      doctorId: 'doc_kavita',
      doctorName: 'Dr. Kavita Rao, MD',
      action: 'Viewed TSH Longitudinal Chart',
      accessedAt: '2026-09-18T11:12:00Z',
    },
  ],
  insightCache: {},
};
