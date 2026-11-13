import React, { useState } from 'react';
import { Home, TrendingUp, SlidersHorizontal, LogOut } from 'lucide-react';
import type { PatientTab } from '../types';
import { useHealthStore } from '../store/healthStore';
import { HomeView } from './HomeView';
import { ScanUploadFlow } from './ScanUploadFlow';
import { TrendExplorer } from './TrendExplorer';
import { SettingsFamilyView } from './SettingsFamilyView';

export const PatientPortal: React.FC = () => {
  const { activeProfile, signOut } = useHealthStore();
  const [activeTab, setActiveTab] = useState<PatientTab>('home');
  const [isScanning, setIsScanning] = useState(false);
  const [focusedBiomarkerKey, setFocusedBiomarkerKey] = useState<string | null>(null);

  const handleInspectBiomarker = (biomarkerKey: string) => {
    setFocusedBiomarkerKey(biomarkerKey);
    setActiveTab('trends');
    setIsScanning(false);
  };

  const handleSelectTab = (tab: PatientTab) => {
    setActiveTab(tab);
    setIsScanning(false);
    if (tab !== 'trends') {
      setFocusedBiomarkerKey(null);
    }
  };

  const navItems: Array<{ id: PatientTab; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'trends', label: 'Trends', icon: <TrendingUp className="w-5 h-5" /> },
    {
      id: 'settings',
      label: 'Settings / Family',
      icon: <SlidersHorizontal className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F8] pb-24 md:pb-12">
      {/* Clean 3-Zone Top Bar */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={() => handleSelectTab('home')}
            className="font-display text-lg font-bold tracking-tight text-gray-900 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Vitalsense
          </button>

          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-8"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectTab(item.id)}
                  className={`py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                    isActive
                      ? 'text-emerald-800 border-emerald-500'
                      : 'text-gray-500 border-transparent hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

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

      {/* Main Content Container with generous whitespace */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        {isScanning ? (
          <ScanUploadFlow
            onClose={() => setIsScanning(false)}
            onSaved={() => {
              setIsScanning(false);
              setActiveTab('home');
            }}
          />
        ) : activeTab === 'home' ? (
          <HomeView
            onOpenUpload={() => setIsScanning(true)}
            onInspectBiomarker={handleInspectBiomarker}
          />
        ) : activeTab === 'trends' ? (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
                Historical Trends
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Select a biomarker to inspect confirmed history for {activeProfile.name}.
              </p>
            </div>
            <TrendExplorer
              profile={activeProfile}
              initialBiomarkerKey={focusedBiomarkerKey}
              audience="patient"
              onEmptyAction={() => {
                setActiveTab('home');
                setIsScanning(true);
              }}
            />
          </div>
        ) : (
          <SettingsFamilyView />
        )}
      </main>

      {/* Mobile Bottom 3-Tab Bar */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 grid grid-cols-3 h-16"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors cursor-pointer ${
                isActive ? 'text-emerald-700' : 'text-gray-500'
              }`}
            >
              {item.icon}
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
