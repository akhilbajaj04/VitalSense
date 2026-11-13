import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  HealthStoreState,
  UserSession,
  FamilyProfile,
  BiomarkerReading,
  ParsedMarkerDraft,
  ConsentLink,
  AuditLogEntry,
} from '../types';
import {
  INITIAL_HEALTH_STATE,
  DEMO_ACCOUNTS,
  computeBiomarkerStatus,
} from '../data/seedData';

const STORAGE_KEY = 'vitalsense_clinical_state_v1';

export interface BiomarkerSeries {
  key: string;
  name: string;
  unit: string;
  minRef: number;
  maxRef: number;
  latest: BiomarkerReading;
  points: BiomarkerReading[];
}

interface HealthContextValue {
  state: HealthStoreState;
  activeProfile: FamilyProfile;
  patientFamilyProfiles: FamilyProfile[];
  signInAsPatient: (email?: string) => void;
  signInAsDoctor: (email?: string) => void;
  signOut: () => void;
  setActiveProfile: (profileId: string) => void;
  addFamilyProfile: (input: {
    name: string;
    relation: string;
    age: number;
    gender: string;
    bloodGroup: string;
  }) => void;
  updateProfileInfo: (
    profileId: string,
    updates: Partial<Pick<FamilyProfile, 'name' | 'age' | 'gender' | 'bloodGroup' | 'email' | 'phone'>>
  ) => void;
  linkAbhaId: (profileId: string, abhaId: string) => void;
  unlinkAbhaId: (profileId: string) => void;
  saveVerifiedReport: (
    profileId: string,
    labName: string,
    reportDate: string,
    markers: ParsedMarkerDraft[]
  ) => void;
  createConsentLink: (input: {
    profileId: string;
    doctorName: string;
    specialty: string;
    clinic: string;
  }) => ConsentLink;
  revokeConsentLink: (linkId: string) => void;
  recordDoctorAccess: (profileId: string, doctorId: string, doctorName: string, action: string) => void;
  deleteProfileData: (profileId: string) => void;
  resetAllData: () => void;
  setInsightCache: (cacheKey: string, insight: string) => void;
}

const HealthContext = createContext<HealthContextValue | null>(null);

function loadInitialState(): HealthStoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_HEALTH_STATE;
    const parsed = JSON.parse(raw) as HealthStoreState;
    if (!parsed || !Array.isArray(parsed.profiles) || parsed.profiles.length === 0) {
      return INITIAL_HEALTH_STATE;
    }
    return parsed;
  } catch {
    return INITIAL_HEALTH_STATE;
  }
}

export function extractBiomarkerSeries(profile: FamilyProfile): BiomarkerSeries[] {
  const byKey = new Map<string, BiomarkerReading[]>();

  for (const report of profile.reports) {
    for (const reading of report.readings) {
      const list = byKey.get(reading.key) ?? [];
      list.push(reading);
      byKey.set(reading.key, list);
    }
  }

  const series: BiomarkerSeries[] = [];
  for (const [key, list] of byKey.entries()) {
    const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date));
    const latest = sorted[sorted.length - 1];
    series.push({
      key,
      name: latest.name,
      unit: latest.unit,
      minRef: latest.minRef,
      maxRef: latest.maxRef,
      latest,
      points: sorted,
    });
  }

  // Sort out-of-bounds markers first, then alphabetically
  return series.sort((a, b) => {
    const aOut = a.latest.status !== 'normal' ? 0 : 1;
    const bOut = b.latest.status !== 'normal' ? 0 : 1;
    if (aOut !== bOut) return aOut - bOut;
    return a.name.localeCompare(b.name);
  });
}

export function getOutOfBoundsLatest(profile: FamilyProfile): BiomarkerReading[] {
  return extractBiomarkerSeries(profile)
    .map((s) => s.latest)
    .filter((r) => r.status !== 'normal');
}

export function getLatestReportDate(profile: FamilyProfile): string | null {
  if (profile.reports.length === 0) return null;
  const sorted = [...profile.reports].sort((a, b) => b.reportDate.localeCompare(a.reportDate));
  return sorted[0].reportDate;
}

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<HealthStoreState>(loadInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  const patientFamilyProfiles = state.profiles.filter(
    (p) => p.ownerAccountId === 'acc_aarav'
  );

  const activeProfile =
    patientFamilyProfiles.find((p) => p.id === state.activeProfileId) ||
    patientFamilyProfiles[0] ||
    state.profiles[0];

  const signInAsPatient = useCallback((email?: string) => {
    const session: UserSession = {
      ...DEMO_ACCOUNTS.patient,
      email: email?.trim() || DEMO_ACCOUNTS.patient.email,
    };
    setState((prev) => ({
      ...prev,
      session,
    }));
  }, []);

  const signInAsDoctor = useCallback((email?: string) => {
    const session: UserSession = {
      ...DEMO_ACCOUNTS.doctor,
      email: email?.trim() || DEMO_ACCOUNTS.doctor.email,
    };
    setState((prev) => ({
      ...prev,
      session,
    }));
  }, []);

  const signOut = useCallback(() => {
    setState((prev) => ({
      ...prev,
      session: null,
    }));
  }, []);

  const setActiveProfile = useCallback((profileId: string) => {
    setState((prev) => ({
      ...prev,
      activeProfileId: profileId,
    }));
  }, []);

  const addFamilyProfile = useCallback(
    (input: {
      name: string;
      relation: string;
      age: number;
      gender: string;
      bloodGroup: string;
    }) => {
      const id = `prof_${Date.now()}`;
      const newProfile: FamilyProfile = {
        id,
        ownerAccountId: 'acc_aarav',
        name: input.name.trim(),
        relation: input.relation.trim(),
        age: input.age,
        gender: input.gender,
        bloodGroup: input.bloodGroup,
        email: '',
        phone: '',
        reports: [],
      };
      setState((prev) => ({
        ...prev,
        profiles: [...prev.profiles, newProfile],
        activeProfileId: id,
      }));
    },
    []
  );

  const updateProfileInfo = useCallback(
    (
      profileId: string,
      updates: Partial<Pick<FamilyProfile, 'name' | 'age' | 'gender' | 'bloodGroup' | 'email' | 'phone'>>
    ) => {
      setState((prev) => ({
        ...prev,
        profiles: prev.profiles.map((p) =>
          p.id === profileId ? { ...p, ...updates } : p
        ),
      }));
    },
    []
  );

  const linkAbhaId = useCallback((profileId: string, abhaId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.id === profileId ? { ...p, abhaId, abhaLinkedAt: today } : p
      ),
    }));
  }, []);

  const unlinkAbhaId = useCallback((profileId: string) => {
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.id === profileId ? { ...p, abhaId: undefined, abhaLinkedAt: undefined } : p
      ),
    }));
  }, []);

  const saveVerifiedReport = useCallback(
    (
      profileId: string,
      labName: string,
      reportDate: string,
      markers: ParsedMarkerDraft[]
    ) => {
      const reportId = `rep_${Date.now()}`;
      const readings: BiomarkerReading[] = markers.map((m, idx) => {
        const numVal = Number.parseFloat(m.value);
        const safeVal = Number.isFinite(numVal) ? numVal : 0;
        return {
          id: `${reportId}_${idx}`,
          key: m.key,
          name: m.name,
          value: safeVal,
          unit: m.unit,
          minRef: m.minRef,
          maxRef: m.maxRef,
          date: reportDate,
          status: computeBiomarkerStatus(safeVal, m.minRef, m.maxRef),
          verification:
            m.verification === 'auto_confirmed' ? 'auto_confirmed' : 'manual_verified',
        };
      });

      setState((prev) => {
        // Invalidate insight cache entries for this profile so Gemini regenerates fresh summaries
        const nextCache: Record<string, string> = {};
        for (const [k, v] of Object.entries(prev.insightCache)) {
          if (!k.startsWith(`${profileId}::`)) {
            nextCache[k] = v;
          }
        }

        return {
          ...prev,
          profiles: prev.profiles.map((p) =>
            p.id === profileId
              ? {
                  ...p,
                  reports: [
                    ...p.reports,
                    {
                      id: reportId,
                      labName,
                      reportDate,
                      uploadedAt: new Date().toISOString(),
                      readings,
                    },
                  ],
                }
              : p
          ),
          insightCache: nextCache,
        };
      });
    },
    []
  );

  const createConsentLink = useCallback(
    (input: {
      profileId: string;
      doctorName: string;
      specialty: string;
      clinic: string;
    }) => {
      const today = new Date();
      const expiry = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
      const isKavita = input.doctorName.toLowerCase().includes('kavita');
      const link: ConsentLink = {
        id: `c_${Date.now()}`,
        profileId: input.profileId,
        doctorId: isKavita ? 'doc_kavita' : `doc_${Date.now()}`,
        doctorName: input.doctorName.trim(),
        specialty: input.specialty.trim() || 'General Medicine',
        clinic: input.clinic.trim() || 'Consulting Clinic',
        shareCode: `VS-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.floor(
          1000 + Math.random() * 9000
        )}`,
        createdAt: today.toISOString().slice(0, 10),
        expiresAt: expiry.toISOString().slice(0, 10),
        status: 'active',
      };
      setState((prev) => ({
        ...prev,
        consentLinks: [link, ...prev.consentLinks],
      }));
      return link;
    },
    []
  );

  const revokeConsentLink = useCallback((linkId: string) => {
    setState((prev) => ({
      ...prev,
      consentLinks: prev.consentLinks.map((c) =>
        c.id === linkId ? { ...c, status: 'revoked' } : c
      ),
    }));
  }, []);

  const recordDoctorAccess = useCallback(
    (profileId: string, doctorId: string, doctorName: string, action: string) => {
      setState((prev) => {
        const profile = prev.profiles.find((p) => p.id === profileId);
        if (!profile) return prev;
        const entry: AuditLogEntry = {
          id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          profileId,
          profileName: profile.name,
          doctorId,
          doctorName,
          action,
          accessedAt: new Date().toISOString(),
        };
        return {
          ...prev,
          auditLogs: [entry, ...prev.auditLogs],
        };
      });
    },
    []
  );

  const deleteProfileData = useCallback((profileId: string) => {
    setState((prev) => {
      const target = prev.profiles.find((p) => p.id === profileId);
      if (!target) return prev;
      // If deleting primary user's data, clear their reports & ABHA & consent links; if dependent, remove dependent
      if (target.relation === 'Primary User') {
        return {
          ...prev,
          profiles: prev.profiles.map((p) =>
            p.id === profileId
              ? { ...p, reports: [], abhaId: undefined, abhaLinkedAt: undefined }
              : p
          ),
          consentLinks: prev.consentLinks.map((c) =>
            c.profileId === profileId ? { ...c, status: 'revoked' } : c
          ),
          auditLogs: prev.auditLogs.filter((a) => a.profileId !== profileId),
          insightCache: {},
        };
      }
      const remaining = prev.profiles.filter((p) => p.id !== profileId);
      const nextActive =
        prev.activeProfileId === profileId
          ? remaining.find((p) => p.ownerAccountId === 'acc_aarav')?.id || remaining[0]?.id || ''
          : prev.activeProfileId;

      return {
        ...prev,
        profiles: remaining,
        activeProfileId: nextActive,
        consentLinks: prev.consentLinks.filter((c) => c.profileId !== profileId),
        auditLogs: prev.auditLogs.filter((a) => a.profileId !== profileId),
      };
    });
  }, []);

  const resetAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState((prev) => ({
      ...INITIAL_HEALTH_STATE,
      session: prev.session,
    }));
  }, []);

  const setInsightCache = useCallback((cacheKey: string, insight: string) => {
    setState((prev) => ({
      ...prev,
      insightCache: {
        ...prev.insightCache,
        [cacheKey]: insight,
      },
    }));
  }, []);

  return (
    <HealthContext.Provider
      value={{
        state,
        activeProfile,
        patientFamilyProfiles,
        signInAsPatient,
        signInAsDoctor,
        signOut,
        setActiveProfile,
        addFamilyProfile,
        updateProfileInfo,
        linkAbhaId,
        unlinkAbhaId,
        saveVerifiedReport,
        createConsentLink,
        revokeConsentLink,
        recordDoctorAccess,
        deleteProfileData,
        resetAllData,
        setInsightCache,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};

export function useHealthStore(): HealthContextValue {
  const ctx = useContext(HealthContext);
  if (!ctx) {
    throw new Error('useHealthStore must be used inside HealthProvider');
  }
  return ctx;
}
