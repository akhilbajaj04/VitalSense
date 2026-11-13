import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  History,
  UserCog,
  Plus,
  Copy,
  Check,
  Trash2,
} from 'lucide-react';
import { useHealthStore } from '../store/healthStore';

type SettingsSection = 'family' | 'consent' | 'audit' | 'account';

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatAbhaInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 14);
  const parts: string[] = [];
  if (digits.length > 0) parts.push(digits.slice(0, 2));
  if (digits.length > 2) parts.push(digits.slice(2, 6));
  if (digits.length > 6) parts.push(digits.slice(6, 10));
  if (digits.length > 10) parts.push(digits.slice(10, 14));
  return parts.join('-');
}

export const SettingsFamilyView: React.FC = () => {
  const {
    state,
    activeProfile,
    patientFamilyProfiles,
    setActiveProfile,
    addFamilyProfile,
    updateProfileInfo,
    linkAbhaId,
    unlinkAbhaId,
    createConsentLink,
    revokeConsentLink,
    deleteProfileData,
    resetAllData,
  } = useHealthStore();

  const [section, setSection] = useState<SettingsSection>('family');

  // Add Family Member modal state
  const [showAddMember, setShowAddMember] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('Spouse');
  const [newAge, setNewAge] = useState('32');
  const [newGender, setNewGender] = useState('Female');
  const [newBloodGroup, setNewBloodGroup] = useState('A+');

  // Share with Doctor modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [docName, setDocName] = useState('Dr. Kavita Rao, MD');
  const [docSpecialty, setDocSpecialty] = useState('Internal Medicine');
  const [docClinic, setDocClinic] = useState('Metro Health Clinic');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Account & ABHA form state
  const [abhaDraft, setAbhaDraft] = useState(activeProfile.abhaId || '');
  const [abhaError, setAbhaError] = useState<string | null>(null);
  const [editName, setEditName] = useState(activeProfile.name);
  const [editAge, setEditAge] = useState(String(activeProfile.age));
  const [editBlood, setEditBlood] = useState(activeProfile.bloodGroup);
  const [editPhone, setEditPhone] = useState(activeProfile.phone);
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const syncAccountFields = (profileId: string) => {
    const found = patientFamilyProfiles.find((p) => p.id === profileId);
    if (!found) return;
    setAbhaDraft(found.abhaId || '');
    setAbhaError(null);
    setEditName(found.name);
    setEditAge(String(found.age));
    setEditBlood(found.bloodGroup);
    setEditPhone(found.phone);
    setSavedFeedback(null);
  };

  const handleSelectProfile = (profileId: string) => {
    setActiveProfile(profileId);
    syncAccountFields(profileId);
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addFamilyProfile({
      name: newName,
      relation: newRelation,
      age: Math.max(1, Number.parseInt(newAge, 10) || 30),
      gender: newGender,
      bloodGroup: newBloodGroup,
    });
    setNewName('');
    setShowAddMember(false);
  };

  const handleCreateConsent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;
    createConsentLink({
      profileId: activeProfile.id,
      doctorName: docName,
      specialty: docSpecialty,
      clinic: docClinic,
    });
    setShowShareModal(false);
  };

  const handleCopyCode = (id: string, code: string) => {
    void navigator.clipboard?.writeText(`https://vitalsense.health/share/${code}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleLinkAbha = (e: React.FormEvent) => {
    e.preventDefault();
    const digitsOnly = abhaDraft.replace(/\D/g, '');
    if (digitsOnly.length !== 14) {
      setAbhaError('Enter a valid 14-digit ABHA number (XX-XXXX-XXXX-XXXX).');
      return;
    }
    setAbhaError(null);
    linkAbhaId(activeProfile.id, formatAbhaInput(digitsOnly));
    setSavedFeedback('ABHA ID linked');
    setTimeout(() => setSavedFeedback(null), 2000);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileInfo(activeProfile.id, {
      name: editName.trim() || activeProfile.name,
      age: Math.max(1, Number.parseInt(editAge, 10) || activeProfile.age),
      bloodGroup: editBlood,
      phone: editPhone.trim(),
    });
    setSavedFeedback('Profile details updated');
    setTimeout(() => setSavedFeedback(null), 2000);
  };

  const profileConsentLinks = state.consentLinks.filter(
    (c) => c.profileId === activeProfile.id
  );
  const profileAuditLogs = state.auditLogs.filter(
    (a) => a.profileId === activeProfile.id
  );

  const subTabs: Array<{ id: SettingsSection; label: string; icon: React.ReactNode }> = [
    { id: 'family', label: 'Family Profiles', icon: <Users className="w-4 h-4" /> },
    { id: 'consent', label: 'Consent & Sharing', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit Logs', icon: <History className="w-4 h-4" /> },
    { id: 'account', label: 'Account & ABHA', icon: <UserCog className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
            Settings & Family
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Active context: <strong className="text-gray-800">{activeProfile.name}</strong> ({activeProfile.relation})
          </p>
        </div>
      </div>

      {/* Progressive Disclosure Sub-Navigation Pills */}
      <div
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1"
        role="tablist"
        aria-label="Settings sections"
      >
        {subTabs.map((tab) => {
          const active = section === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setSection(tab.id);
                syncAccountFields(activeProfile.id);
              }}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:text-gray-900 shadow-sm'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Profile Switcher */}
      {section === 'family' && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-gray-900">
                Family Profiles
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Switch active blood report context between yourself and dependents.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddMember(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Family Member</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patientFamilyProfiles.map((profile) => {
              const isCurrent = profile.id === activeProfile.id;
              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => handleSelectProfile(profile.id)}
                  className={`p-5 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isCurrent
                      ? 'bg-emerald-50/70 ring-1 ring-emerald-300'
                      : 'bg-[#F4F6F8] hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-display font-semibold text-sm shrink-0 ${
                        isCurrent
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-gray-700 shadow-sm'
                      }`}
                    >
                      {profile.name
                        .split(' ')
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {profile.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {profile.relation} · {profile.age} yrs · {profile.bloodGroup}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap shrink-0 ${
                      isCurrent
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-gray-600 shadow-sm'
                    }`}
                  >
                    {isCurrent ? 'Active' : 'Switch'}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 2. Consent & Sharing Manager */}
      {section === 'consent' && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-gray-900">
                Consent & Sharing Manager
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Active access links for {activeProfile.name}. Revoking access immediately removes you from that physician&apos;s roster.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Share with Doctor</span>
            </button>
          </div>

          {profileConsentLinks.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">
              No doctor share links created for {activeProfile.name} yet.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {profileConsentLinks.map((link) => {
                const isActive = link.status === 'active';
                return (
                  <li
                    key={link.id}
                    className="py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-medium text-gray-900">
                          {link.doctorName}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {isActive ? 'Active Access' : 'Revoked'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {link.specialty} · {link.clinic} · Code{' '}
                        <span className="font-mono-nums text-gray-700">
                          {link.shareCode}
                        </span>{' '}
                        · Expires {link.expiresAt}
                      </p>
                    </div>

                    {isActive && (
                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyCode(link.id, link.shareCode)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F4F6F8] hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors cursor-pointer"
                        >
                          {copiedId === link.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => revokeConsentLink(link.id)}
                          className="px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Revoke Access
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* 3. Audit Logs */}
      {section === 'audit' && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-gray-900">
              Audit Logs
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Chronological record of every time an authenticated physician accessed {activeProfile.name}&apos;s shared reports.
            </p>
          </div>

          {profileAuditLogs.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">
              No physician views recorded for {activeProfile.name} yet.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {profileAuditLogs.map((entry) => (
                <li
                  key={entry.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {entry.doctorName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{entry.action}</p>
                  </div>
                  <span className="font-mono-nums text-xs text-gray-500 shrink-0">
                    {formatTimestamp(entry.accessedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* 4. Account & ABHA Settings */}
      {section === 'account' && (
        <div className="space-y-6">
          {/* ABHA ID Linking */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-gray-900">
                  ABHA Health ID
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Link your 14-digit Ayushman Bharat Health Account for verified lab sync.
                </p>
              </div>
              {activeProfile.abhaId && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">
                  Linked
                </span>
              )}
            </div>

            {activeProfile.abhaId ? (
              <div className="p-4 rounded-2xl bg-[#F4F6F8] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-mono-nums text-base font-semibold text-gray-900">
                    {activeProfile.abhaId}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Linked on {activeProfile.abhaLinkedAt || '2026-06-14'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    unlinkAbhaId(activeProfile.id);
                    setAbhaDraft('');
                  }}
                  className="px-4 py-2 rounded-full bg-white text-gray-700 hover:text-rose-700 text-xs font-medium shadow-sm transition-colors cursor-pointer"
                >
                  Unlink ABHA ID
                </button>
              </div>
            ) : (
              <form onSubmit={handleLinkAbha} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="91-XXXX-XXXX-XXXX"
                  value={abhaDraft}
                  onChange={(e) => setAbhaDraft(formatAbhaInput(e.target.value))}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#F4F6F8] font-mono-nums text-sm text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-800 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  Link ABHA ID
                </button>
              </form>
            )}
            {abhaError && <p className="text-xs text-rose-600">{abhaError}</p>}
          </section>

          {/* Personal Info */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-lg font-semibold text-gray-900">
                Personal Information
              </h2>
              {savedFeedback && (
                <span className="text-xs font-medium text-emerald-700">
                  {savedFeedback}
                </span>
              )}
            </div>

            <form onSubmit={handleSaveAccount} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F4F6F8] text-sm text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Age
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={editAge}
                  onChange={(e) => setEditAge(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F4F6F8] font-mono-nums text-sm text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Blood Group
                </label>
                <select
                  value={editBlood}
                  onChange={(e) => setEditBlood(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F4F6F8] text-sm text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F4F6F8] font-mono-nums text-sm text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div className="sm:col-span-2 flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-800 text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  Save Details
                </button>
              </div>
            </form>
          </section>

          {/* Delete Data */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-semibold text-gray-900">
                Delete Data
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Permanently remove blood reports and sharing links for {activeProfile.name}.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={resetAllData}
                className="px-4 py-2.5 rounded-full bg-[#F4F6F8] hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors cursor-pointer"
              >
                Restore Sample Data
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(true)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Data</span>
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Add Family Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl max-w-md w-full">
            <h3 className="font-display text-lg font-semibold text-gray-900">
              Add Family Member
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Create a dependent profile to organize their lab reports separately.
            </p>
            <form onSubmit={handleCreateMember} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Rohan Sharma"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F4F6F8] text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Relation
                  </label>
                  <select
                    value={newRelation}
                    onChange={(e) => setNewRelation(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F4F6F8] text-sm"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Child (Dependent)">Child (Dependent)</option>
                    <option value="Parent (Dependent)">Parent (Dependent)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F4F6F8] font-mono-nums text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Gender
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F4F6F8] text-sm"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={newBloodGroup}
                    onChange={(e) => setNewBloodGroup(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F4F6F8] text-sm"
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="px-5 py-2.5 rounded-full bg-[#F4F6F8] text-gray-700 text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-800 text-white text-sm font-semibold cursor-pointer"
                >
                  Add Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share with Doctor Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl max-w-md w-full">
            <h3 className="font-display text-lg font-semibold text-gray-900">
              Share Reports with Physician
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Grant read-only access to {activeProfile.name}&apos;s flagged markers and trend charts.
            </p>
            <form onSubmit={handleCreateConsent} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Physician Name
                </label>
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F4F6F8] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Specialty
                </label>
                <input
                  type="text"
                  value={docSpecialty}
                  onChange={(e) => setDocSpecialty(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F4F6F8] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Clinic / Hospital
                </label>
                <input
                  type="text"
                  value={docClinic}
                  onChange={(e) => setDocClinic(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F4F6F8] text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="px-5 py-2.5 rounded-full bg-[#F4F6F8] text-gray-700 text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-800 text-white text-sm font-semibold cursor-pointer"
                >
                  Grant Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl max-w-md w-full">
            <h3 className="font-display text-lg font-semibold text-gray-900">
              Delete {activeProfile.name}&apos;s data?
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {activeProfile.relation === 'Primary User'
                ? 'This will clear all blood reports, revoke doctor share links, and unlink ABHA ID from your primary profile.'
                : 'This will permanently remove this dependent profile and all their uploaded reports.'}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(false)}
                className="px-5 py-2.5 rounded-full bg-[#F4F6F8] text-gray-700 text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProfileData(activeProfile.id);
                  setConfirmDeleteOpen(false);
                }}
                className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
