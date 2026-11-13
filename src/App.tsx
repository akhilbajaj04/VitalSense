/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HealthProvider, useHealthStore } from './store/healthStore';
import { AuthGate } from './components/AuthGate';
import { PatientPortal } from './components/PatientPortal';
import { DoctorDashboard } from './components/DoctorDashboard';

const SessionRouter: React.FC = () => {
  const { state } = useHealthStore();

  if (!state.session) {
    return <AuthGate />;
  }

  if (state.session.role === 'doctor') {
    return <DoctorDashboard />;
  }

  return <PatientPortal />;
};

export default function App() {
  return (
    <HealthProvider>
      <SessionRouter />
    </HealthProvider>
  );
}
