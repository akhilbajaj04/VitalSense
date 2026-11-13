import React from 'react';
import { ScanLine, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import {
  useHealthStore,
  getOutOfBoundsLatest,
  getLatestReportDate,
} from '../store/healthStore';

interface HomeViewProps {
  onOpenUpload: () => void;
  onInspectBiomarker: (biomarkerKey: string) => void;
}

function formatReadableDate(isoDate: string | null): string {
  if (!isoDate) return 'No reports yet';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenUpload,
  onInspectBiomarker,
}) => {
  const { activeProfile } = useHealthStore();
  const outOfBounds = getOutOfBoundsLatest(activeProfile);
  const latestDate = getLatestReportDate(activeProfile);

  return (
    <div className="space-y-8">
      {/* Prominent Scan/Upload New Report CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
            {activeProfile.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {activeProfile.relation} · Last report {formatReadableDate(latestDate)}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenUpload}
          className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-800 text-white text-sm font-semibold shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ScanLine className="w-4 h-4" />
          <span>Scan / Upload New Report</span>
        </button>
      </div>

      {/* Out of Bounds Summary Card (Normal markers hidden) */}
      <section
        aria-labelledby="out-of-bounds-heading"
        className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2 pb-6 border-b border-gray-100">
          <div>
            <h2
              id="out-of-bounds-heading"
              className="font-display text-lg font-semibold text-gray-900"
            >
              Out of Bounds
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Showing only the most recent flagged markers. Normal markers are hidden.
            </p>
          </div>
          {outOfBounds.length > 0 && (
            <span className="text-xs font-medium text-rose-700 bg-rose-50 px-3 py-1 rounded-full whitespace-nowrap shrink-0">
              {outOfBounds.length} {outOfBounds.length === 1 ? 'marker' : 'markers'} flagged
            </span>
          )}
        </div>

        {outOfBounds.length === 0 ? (
          <div className="py-10 text-center">
            <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="font-display text-base font-semibold text-gray-900">
              {activeProfile.reports.length === 0
                ? 'No blood reports uploaded yet'
                : 'All recent markers are within normal range'}
            </p>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
              {activeProfile.reports.length === 0
                ? 'Scan or upload a blood report to extract biomarkers and monitor flagged results.'
                : 'Out-of-bounds alerts will appear here automatically whenever a future reading falls outside reference limits.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {outOfBounds.map((marker) => {
              const isHigh = marker.status === 'high';
              return (
                <li key={marker.id}>
                  <button
                    type="button"
                    onClick={() => onInspectBiomarker(marker.key)}
                    className="w-full py-5 flex items-center justify-between gap-4 text-left group hover:bg-gray-50/70 -mx-3 px-3 rounded-2xl transition-colors cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-medium text-base text-gray-900">
                          {marker.name}
                        </span>
                        <span
                          className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 whitespace-nowrap"
                        >
                          {isHigh ? 'High' : 'Low'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Normal range: {marker.minRef}–{marker.maxRef} {marker.unit} · Tested{' '}
                        {formatReadableDate(marker.date)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="font-mono-nums text-xl font-semibold text-gray-900">
                          {marker.value}
                        </span>
                        <span className="ml-1.5 text-xs text-gray-500">
                          {marker.unit}
                        </span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-700 transition-colors" />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};
