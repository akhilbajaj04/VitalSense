import React, { useState, useMemo } from 'react';
import { LogOut, ChevronRight, CheckCircle2 } from 'lucide-react';
import {
  useHealthStore,
  getOutOfBoundsLatest,
  getLatestReportDate,
} from '../store/healthStore';
import { TrendExplorer } from './TrendExplorer';

export const DoctorDashboard: React.FC = () => {
  const { state, signOut, recordDoctorAccess } = useHealthStore();
  const session = state.session;

  // Only show patients with an active consent link for this authenticated doctor
  const consentedPatients = useMemo(() => {
    if (!session) return [];
    const activeProfileIds = new Set(
      state.consentLinks
        .filter((c) => c.doctorId === session.userId && c.status === 'active')
        .map((c) => c.profileId)
    );
    return state.profiles.filter((p) => activeProfileIds.has(p.id));
  }, [state.consentLinks, state.profiles, session]);

  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    () => consentedPatients[0]?.id || ''
  );
  const [focusedBiomarkerKey, setFocusedBiomarkerKey] = useState<string | null>(null);

  const selectedPatient =
    consentedPatients.find((p) => p.id === selectedPatientId) ||
    consentedPatients[0] ||
    null;

  const handleSelectPatient = (profileId: string) => {
    setSelectedPatientId(profileId);
    setFocusedBiomarkerKey(null);
    if (session) {
      recordDoctorAccess(
        profileId,
        session.userId,
        session.name,
        'Viewed Out-of-Bounds Summary & Trend Charts'
      );
    }
  };

  const outOfBounds = selectedPatient ? getOutOfBoundsLatest(selectedPatient) : [];
  const latestDate = selectedPatient ? getLatestReportDate(selectedPatient) : null;

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      {/* Clean Top Bar for Authenticated Doctor */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <span className="font-display text-lg font-bold tracking-tight text-gray-900 whitespace-nowrap shrink-0">
            Vitalsense Clinical
          </span>

          <div className="hidden sm:block text-sm text-gray-500 truncate">
            {session?.name} · {session?.subtitle}
          </div>

          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F4F6F8] hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {consentedPatients.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 shadow-sm text-center max-w-lg mx-auto">
            <h1 className="font-display text-xl font-semibold text-gray-900">
              No active patient shares
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Patients appear here once they share a consent link with your medical profile. Any revoked patient links are removed immediately.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Minimalist Patient Roster */}
            <aside className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm">
              <div className="pb-4 border-b border-gray-100">
                <h1 className="font-display text-lg font-semibold text-gray-900">
                  Patient Roster
                </h1>
                <p className="mt-0.5 text-xs text-gray-500">
                  {consentedPatients.length} consented{' '}
                  {consentedPatients.length === 1 ? 'patient' : 'patients'}
                </p>
              </div>

              <ul className="mt-3 space-y-2">
                {consentedPatients.map((patient) => {
                  const flaggedCount = getOutOfBoundsLatest(patient).length;
                  const isSelected = selectedPatient?.id === patient.id;
                  return (
                    <li key={patient.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectPatient(patient.id)}
                        className={`w-full p-4 rounded-2xl text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50/80 ring-1 ring-emerald-300'
                            : 'hover:bg-[#F4F6F8]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-display text-xs font-semibold shrink-0 ${
                              isSelected
                                ? 'bg-emerald-700 text-white'
                                : 'bg-[#F4F6F8] text-gray-700'
                            }`}
                          >
                            {patient.name
                              .split(' ')
                              .map((w) => w[0])
                              .slice(0, 2)
                              .join('')}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {patient.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {patient.age} yrs ·{' '}
                              {flaggedCount > 0 ? (
                                <span className="text-rose-600 font-medium">
                                  {flaggedCount} out of range
                                </span>
                              ) : (
                                <span className="text-emerald-700">All normal</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 shrink-0 ${
                            isSelected ? 'text-emerald-700' : 'text-gray-400'
                          }`}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>

            {/* Selected Patient Clinical View: Out-of-Range Markers + Trend Chart */}
            {selectedPatient && (
              <div className="lg:col-span-8 space-y-8">
                {/* Out of Range Markers Card */}
                <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-4 pb-5 border-b border-gray-100">
                    <div>
                      <h2 className="font-display text-2xl font-semibold text-gray-900">
                        {selectedPatient.name}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        {selectedPatient.age} yrs · {selectedPatient.gender} · Blood Group{' '}
                        {selectedPatient.bloodGroup} · Last panel{' '}
                        {latestDate || 'N/A'}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      Out-of-range markers only
                    </span>
                  </div>

                  {outOfBounds.length === 0 ? (
                    <div className="py-8 text-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">
                        No out-of-range biomarkers for {selectedPatient.name}.
                      </p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {outOfBounds.map((marker) => (
                        <li key={marker.id}>
                          <button
                            type="button"
                            onClick={() => setFocusedBiomarkerKey(marker.key)}
                            className="w-full py-4 flex items-center justify-between gap-4 text-left hover:bg-gray-50/70 -mx-2 px-2 rounded-2xl transition-colors cursor-pointer"
                          >
                            <div>
                              <div className="flex items-center gap-2.5">
                                <span className="font-medium text-gray-900">
                                  {marker.name}
                                </span>
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700">
                                  {marker.status === 'high' ? 'High' : 'Low'}
                                </span>
                              </div>
                              <p className="mt-0.5 text-xs text-gray-500">
                                Reference: {marker.minRef}–{marker.maxRef}{' '}
                                {marker.unit}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="font-mono-nums text-lg font-semibold text-gray-900">
                                {marker.value}
                              </span>
                              <span className="ml-1.5 text-xs text-gray-500">
                                {marker.unit}
                              </span>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* Specific Trend Chart Explorer */}
                <TrendExplorer
                  profile={selectedPatient}
                  initialBiomarkerKey={focusedBiomarkerKey}
                  audience="doctor"
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
