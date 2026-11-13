export type UserRole = 'patient' | 'doctor';

export type PatientTab = 'home' | 'trends' | 'settings';

export type BiomarkerStatus = 'normal' | 'high' | 'low';

export type VerificationState = 'auto_confirmed' | 'manual_verified' | 'uncertain';

export interface UserSession {
  role: UserRole;
  userId: string;
  name: string;
  email: string;
  subtitle: string;
}

export interface BiomarkerReading {
  id: string;
  key: string;
  name: string;
  value: number;
  unit: string;
  minRef: number;
  maxRef: number;
  date: string; // YYYY-MM-DD
  status: BiomarkerStatus;
  verification: 'auto_confirmed' | 'manual_verified';
}

export interface LabReport {
  id: string;
  labName: string;
  reportDate: string; // YYYY-MM-DD
  uploadedAt: string;
  readings: BiomarkerReading[];
}

export interface FamilyProfile {
  id: string;
  ownerAccountId: string;
  name: string;
  relation: string;
  age: number;
  gender: string;
  bloodGroup: string;
  email: string;
  phone: string;
  abhaId?: string;
  abhaLinkedAt?: string;
  reports: LabReport[];
}

export interface ConsentLink {
  id: string;
  profileId: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  clinic: string;
  shareCode: string;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'revoked';
}

export interface AuditLogEntry {
  id: string;
  profileId: string;
  profileName: string;
  doctorId: string;
  doctorName: string;
  action: string;
  accessedAt: string; // ISO string
}

export interface ParsedMarkerDraft {
  id: string;
  key: string;
  name: string;
  value: string; // string while editing in Review Data
  unit: string;
  minRef: number;
  maxRef: number;
  verification: VerificationState;
  uncertaintyNote?: string;
}

export interface ParsedReportDraft {
  labName: string;
  reportDate: string;
  fileName: string;
  markers: ParsedMarkerDraft[];
}

export interface HealthStoreState {
  session: UserSession | null;
  activeProfileId: string;
  profiles: FamilyProfile[];
  consentLinks: ConsentLink[];
  auditLogs: AuditLogEntry[];
  insightCache: Record<string, string>;
}
