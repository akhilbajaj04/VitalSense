import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import type { FamilyProfile } from '../types';
import { extractBiomarkerSeries, useHealthStore } from '../store/healthStore';
import { BiomarkerChart } from './BiomarkerChart';

interface TrendExplorerProps {
  profile: FamilyProfile;
  initialBiomarkerKey?: string | null;
  audience: 'patient' | 'doctor';
  onEmptyAction?: () => void;
}

export const TrendExplorer: React.FC<TrendExplorerProps> = ({
  profile,
  initialBiomarkerKey,
  audience,
  onEmptyAction,
}) => {
  const { state, setInsightCache } = useHealthStore();
  const seriesList = useMemo(() => extractBiomarkerSeries(profile), [profile]);

  const [selectedKey, setSelectedKey] = useState<string>(() => {
    if (initialBiomarkerKey && seriesList.some((s) => s.key === initialBiomarkerKey)) {
      return initialBiomarkerKey;
    }
    return seriesList[0]?.key || '';
  });

  useEffect(() => {
    if (initialBiomarkerKey && seriesList.some((s) => s.key === initialBiomarkerKey)) {
      setSelectedKey(initialBiomarkerKey);
      return;
    }
    if (!seriesList.some((s) => s.key === selectedKey)) {
      setSelectedKey(seriesList[0]?.key || '');
    }
  }, [initialBiomarkerKey, seriesList, selectedKey]);

  const activeSeries = seriesList.find((s) => s.key === selectedKey) || seriesList[0];

  const cacheKey = activeSeries
    ? `${profile.id}::${activeSeries.key}::${audience}::${activeSeries.points
        .map((p) => `${p.date}:${p.value}`)
        .join('|')}`
    : '';

  const cachedInsight = cacheKey ? state.insightCache[cacheKey] : undefined;
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);

  const fetchInsight = async (forceRefresh = false) => {
    if (!activeSeries) return;
    if (!forceRefresh && cachedInsight) return;

    setLoadingInsight(true);
    setInsightError(null);
    try {
      const res = await fetch('/api/trends/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: profile.name,
          age: profile.age,
          biomarkerName: activeSeries.name,
          unit: activeSeries.unit,
          minRef: activeSeries.minRef,
          maxRef: activeSeries.maxRef,
          readings: activeSeries.points.map((p) => ({ date: p.date, value: p.value })),
          audience,
        }),
      });
      const data = (await res.json()) as { insight?: string; error?: string };
      if (!res.ok || !data.insight) {
        throw new Error(data.error || 'Unable to generate AI insight right now.');
      }
      setInsightCache(cacheKey, data.insight);
    } catch (err) {
      setInsightError(
        err instanceof Error ? err.message : 'Unable to generate AI insight.'
      );
    } finally {
      setLoadingInsight(false);
    }
  };

  useEffect(() => {
    if (activeSeries && !cachedInsight) {
      void fetchInsight(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  if (seriesList.length === 0 || !activeSeries) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
        <p className="font-display text-lg font-semibold text-gray-900">
          No confirmed biomarker history yet
        </p>
        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
          Upload and verify a lab report for {profile.name} to unlock longitudinal trends and AI summaries.
        </p>
        {onEmptyAction && (
          <button
            type="button"
            onClick={onEmptyAction}
            className="mt-6 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-800 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Scan / Upload New Report
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Horizontal scrollable row of pill-shaped biomarker selector buttons */}
      <div
        className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1"
        role="tablist"
        aria-label="Select biomarker trend"
      >
        {seriesList.map((s) => {
          const isSelected = s.key === activeSeries.key;
          const isFlagged = s.latest.status !== 'normal';
          return (
            <button
              key={s.key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedKey(s.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:text-gray-900 shadow-sm'
              }`}
            >
              <span>{s.name}</span>
              {isFlagged && (
                <span
                  className={`text-[11px] font-semibold ${
                    isSelected ? 'text-rose-200' : 'text-rose-600'
                  }`}
                >
                  {s.latest.status === 'high' ? 'High' : 'Low'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Single Smooth Line Chart Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-gray-900">
              {activeSeries.name}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {activeSeries.points.length} confirmed{' '}
              {activeSeries.points.length === 1 ? 'reading' : 'readings'} · Reference{' '}
              {activeSeries.minRef}–{activeSeries.maxRef} {activeSeries.unit}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-baseline gap-1.5 justify-end">
              <span className="font-mono-nums text-2xl sm:text-3xl font-bold text-gray-900">
                {activeSeries.latest.value}
              </span>
              <span className="text-sm text-gray-500">{activeSeries.unit}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Latest ·{' '}
              <span
                className={
                  activeSeries.latest.status === 'normal'
                    ? 'text-emerald-700 font-medium'
                    : 'text-rose-600 font-medium'
                }
              >
                {activeSeries.latest.status === 'normal'
                  ? 'Within Range'
                  : activeSeries.latest.status === 'high'
                  ? 'Above Range'
                  : 'Below Range'}
              </span>
            </p>
          </div>
        </div>

        <BiomarkerChart
          points={activeSeries.points}
          minRef={activeSeries.minRef}
          maxRef={activeSeries.maxRef}
          unit={activeSeries.unit}
        />
      </div>

      {/* Spacious AI Insight Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="font-display text-base font-semibold text-gray-900">
              AI Insight
            </h3>
          </div>
          <button
            type="button"
            onClick={() => void fetchInsight(true)}
            disabled={loadingInsight}
            className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
            title="Regenerate insight from confirmed readings"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingInsight ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loadingInsight ? (
          <div className="space-y-2 py-1" aria-busy="true">
            <div className="h-4 bg-gray-100 rounded-full w-11/12 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded-full w-2/3 animate-pulse" />
          </div>
        ) : insightError ? (
          <div className="text-sm text-rose-600 flex items-center justify-between gap-4">
            <span>{insightError}</span>
            <button
              type="button"
              onClick={() => void fetchInsight(true)}
              className="px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-700 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          <p className="text-base text-gray-700 leading-relaxed">
            {cachedInsight || 'Analyzing confirmed biomarker history...'}
          </p>
        )}
      </div>
    </div>
  );
};
