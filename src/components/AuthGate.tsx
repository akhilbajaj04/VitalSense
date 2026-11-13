import React, { useState } from 'react';
import { ArrowRight, Stethoscope, User } from 'lucide-react';
import { useHealthStore } from '../store/healthStore';

export const AuthGate: React.FC = () => {
  const { signInAsPatient, signInAsDoctor } = useHealthStore();
  const [selectedPortal, setSelectedPortal] = useState<'patient' | 'doctor'>('patient');
  const [email, setEmail] = useState('aarav.sharma@vitalsense.health');
  const [password, setPassword] = useState('••••••••••••');

  const handlePortalSwitch = (role: 'patient' | 'doctor') => {
    setSelectedPortal(role);
    setEmail(
      role === 'patient'
        ? 'aarav.sharma@vitalsense.health'
        : 'kavita.rao@metrohealth.org'
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPortal === 'doctor') {
      signInAsDoctor(email);
    } else {
      signInAsPatient(email);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-gray-900">
            Vitalsense
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Quiet clarity for blood reports, family panels, and physician review.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div
            role="tablist"
            aria-label="Account portal selection"
            className="grid grid-cols-2 gap-1.5 p-1.5 bg-[#F4F6F8] rounded-2xl mb-6"
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedPortal === 'patient'}
              onClick={() => handlePortalSwitch('patient')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                selectedPortal === 'patient'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Patient</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={selectedPortal === 'doctor'}
              onClick={() => handlePortalSwitch('doctor')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                selectedPortal === 'doctor'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Physician</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-medium text-gray-500 mb-1.5"
              >
                {selectedPortal === 'doctor' ? 'Medical Council Email' : 'Email Address'}
              </label>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F4F6F8] text-sm text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/30 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs font-medium text-gray-500 mb-1.5"
              >
                Passcode
              </label>
              <input
                id="auth-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F4F6F8] text-sm text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/30 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3.5 px-6 rounded-full bg-emerald-500 hover:bg-emerald-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>
                {selectedPortal === 'doctor'
                  ? 'Sign in to Physician Portal'
                  : 'Sign in to Patient Portal'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              {selectedPortal === 'doctor'
                ? 'Authenticated physicians view only patients who have granted active sharing consent.'
                : 'Manage personal & family blood reports, review AI extractions, and govern doctor access.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
