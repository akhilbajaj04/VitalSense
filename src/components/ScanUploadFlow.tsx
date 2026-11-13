import React, { useState, useRef } from 'react';
import {
  Upload,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Check,
  FileText,
  Sparkles,
} from 'lucide-react';
import type { ParsedReportDraft, ParsedMarkerDraft } from '../types';
import { SAMPLE_LAB_REPORTS, computeBiomarkerStatus } from '../data/seedData';
import { useHealthStore } from '../store/healthStore';

interface ScanUploadFlowProps {
  onClose: () => void;
  onSaved: () => void;
}

interface ParseApiResponse {
  labName: string;
  reportDate: string;
  markers: Array<{
    key: string;
    name: string;
    value: number;
    unit: string;
    minRef: number;
    maxRef: number;
    confidence: string;
    uncertaintyNote?: string;
  }>;
  error?: string;
}

export const ScanUploadFlow: React.FC<ScanUploadFlowProps> = ({
  onClose,
  onSaved,
}) => {
  const { activeProfile, saveVerifiedReport } = useHealthStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [step, setStep] = useState<'upload' | 'parsing' | 'review'>('upload');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [draft, setDraft] = useState<ParsedReportDraft | null>(null);

  const parseWithGemini = async (payload: {
    fileName: string;
    mimeType?: string;
    base64Data?: string;
    rawText?: string;
  }) => {
    setErrorMsg(null);
    setStep('parsing');
    try {
      const res = await fetch('/api/reports/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as ParseApiResponse;
      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse blood report.');
      }

      if (!data.markers || data.markers.length === 0) {
        throw new Error(
          'No biomarkers could be detected from this document. Please try a clearer image or PDF.'
        );
      }

      const markers: ParsedMarkerDraft[] = data.markers.map((m, idx) => ({
        id: `draft_${Date.now()}_${idx}`,
        key: m.key,
        name: m.name,
        value: String(m.value),
        unit: m.unit,
        minRef: Number(m.minRef),
        maxRef: Number(m.maxRef),
        verification:
          m.confidence === 'uncertain' ? 'uncertain' : 'auto_confirmed',
        uncertaintyNote: m.uncertaintyNote,
      }));

      // Sort uncertain values to the top so manual verification is immediate
      markers.sort((a, b) => {
        if (a.verification === 'uncertain' && b.verification !== 'uncertain') return -1;
        if (a.verification !== 'uncertain' && b.verification === 'uncertain') return 1;
        return 0;
      });

      setDraft({
        labName: data.labName,
        reportDate: data.reportDate,
        fileName: payload.fileName,
        markers,
      });
      setStep('review');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to process the uploaded report.'
      );
      setStep('upload');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') return;
      if (file.type === 'text/plain') {
        const text = atob(result.split(',')[1] || '');
        void parseWithGemini({ fileName: file.name, rawText: text });
      } else {
        const base64Data = result.split(',')[1] || '';
        void parseWithGemini({
          fileName: file.name,
          mimeType: file.type || 'image/png',
          base64Data,
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleUseSample = (sampleId: string) => {
    const sample = SAMPLE_LAB_REPORTS.find((s) => s.id === sampleId);
    if (!sample) return;
    void parseWithGemini({
      fileName: `${sample.labName}.txt`,
      rawText: sample.rawText,
    });
  };

  const handleUpdateMarkerValue = (id: string, nextValue: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        markers: prev.markers.map((m) =>
          m.id === id ? { ...m, value: nextValue } : m
        ),
      };
    });
  };

  const handleUpdateMarkerUnit = (id: string, nextUnit: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        markers: prev.markers.map((m) =>
          m.id === id ? { ...m, unit: nextUnit } : m
        ),
      };
    });
  };

  const handleConfirmMarker = (id: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        markers: prev.markers.map((m) => {
          if (m.id !== id) return m;
          const numeric = Number.parseFloat(m.value);
          if (!Number.isFinite(numeric)) return m;
          return {
            ...m,
            verification: 'manual_verified',
          };
        }),
      };
    });
  };

  const uncertainCount = draft
    ? draft.markers.filter((m) => m.verification === 'uncertain').length
    : 0;

  const hasInvalidNumbers = draft
    ? draft.markers.some((m) => !Number.isFinite(Number.parseFloat(m.value)))
    : true;

  const canSave = Boolean(draft && uncertainCount === 0 && !hasInvalidNumbers);

  const handleFinalSave = () => {
    if (!draft || !canSave) return;
    saveVerifiedReport(
      activeProfile.id,
      draft.labName,
      draft.reportDate,
      draft.markers
    );
    onSaved();
  };

  if (step === 'parsing') {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm text-center max-w-2xl mx-auto">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <h2 className="font-display text-xl font-semibold text-gray-900">
          Extracting biomarkers with Gemini AI
        </h2>
        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
          Reading values, reference ranges, and flagging any ambiguous entries for your manual review.
        </p>
        <div className="mt-8 space-y-3 max-w-md mx-auto">
          <div className="h-12 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-12 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-12 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (step === 'review' && draft) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setStep('upload')}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Upload</span>
          </button>
          <span className="text-xs text-gray-500">
            Profile: <strong className="text-gray-800">{activeProfile.name}</strong>
          </span>
        </div>

        {/* Prominent Counter Banner for Uncertain Values */}
        <div
          className={`rounded-3xl p-6 sm:p-8 shadow-sm transition-colors ${
            uncertainCount > 0 ? 'bg-amber-50' : 'bg-emerald-50'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  uncertainCount > 0
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {uncertainCount > 0 ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="font-display text-lg font-semibold text-gray-900">
                  Review Data · {uncertainCount} Uncertain{' '}
                  {uncertainCount === 1 ? 'Value' : 'Values'}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {uncertainCount > 0
                    ? 'Verify or correct every flagged value below before saving to your permanent record.'
                    : 'All biomarkers are confirmed and ready to save to your longitudinal history.'}
                </p>
              </div>
            </div>

            <div className="font-mono-nums text-2xl font-bold text-gray-900 shrink-0">
              {uncertainCount} pending
            </div>
          </div>
        </div>

        {/* Extracted Markers Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <h2 className="font-display text-lg font-semibold text-gray-900">
                {draft.labName}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Report Date: {draft.reportDate} · Source: {draft.fileName}
              </p>
            </div>
            <span className="text-xs text-gray-500">
              {draft.markers.length} biomarkers extracted
            </span>
          </div>

          <ul className="divide-y divide-gray-100">
            {draft.markers.map((marker) => {
              const isUncertain = marker.verification === 'uncertain';
              const numericVal = Number.parseFloat(marker.value);
              const isValidNumber = Number.isFinite(numericVal);
              const previewStatus = isValidNumber
                ? computeBiomarkerStatus(numericVal, marker.minRef, marker.maxRef)
                : 'normal';

              return (
                <li key={marker.id} className="py-5">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-medium text-base text-gray-900">
                          {marker.name}
                        </span>
                        {isUncertain ? (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700">
                            Needs Review
                          </span>
                        ) : marker.verification === 'manual_verified' ? (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                            Manually Verified
                          </span>
                        ) : (
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            Auto-Confirmed
                          </span>
                        )}

                        {isValidNumber && previewStatus !== 'normal' && (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700">
                            {previewStatus === 'high' ? 'High' : 'Low'}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-gray-500">
                        Reference Range: {marker.minRef}–{marker.maxRef} {marker.unit}
                      </p>

                      {isUncertain && marker.uncertaintyNote && (
                        <p className="mt-1.5 text-xs text-amber-700">
                          AI Note: {marker.uncertaintyNote}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="any"
                          aria-label={`${marker.name} value`}
                          value={marker.value}
                          onChange={(e) =>
                            handleUpdateMarkerValue(marker.id, e.target.value)
                          }
                          className={`w-24 px-3 py-2 rounded-xl font-mono-nums text-sm text-right focus:outline-none focus:ring-2 transition-all ${
                            isUncertain
                              ? 'bg-amber-50/70 text-gray-900 ring-1 ring-amber-300 focus:ring-amber-400'
                              : 'bg-[#F4F6F8] text-gray-900 focus:bg-white focus:ring-emerald-500/30'
                          }`}
                        />
                        <input
                          type="text"
                          aria-label={`${marker.name} unit`}
                          value={marker.unit}
                          onChange={(e) =>
                            handleUpdateMarkerUnit(marker.id, e.target.value)
                          }
                          className="w-20 px-3 py-2 rounded-xl bg-[#F4F6F8] text-xs text-gray-600 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
                        />
                      </div>

                      {isUncertain ? (
                        <button
                          type="button"
                          disabled={!isValidNumber}
                          onClick={() => handleConfirmMarker(marker.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-800 disabled:opacity-40 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirm Value</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 px-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Strict Save Footer */}
          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-xs text-gray-500">
              {uncertainCount > 0
                ? `Confirm ${uncertainCount} remaining uncertain ${
                    uncertainCount === 1 ? 'value' : 'values'
                  } to enable saving.`
                : 'Ready to commit verified biomarkers.'}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-full bg-[#F4F6F8] hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canSave}
                onClick={handleFinalSave}
                className="px-7 py-3 rounded-full bg-emerald-500 hover:bg-emerald-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Save Data
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-gray-900">
          Scan or Upload Blood Report
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Uploading for <strong className="text-gray-800">{activeProfile.name}</strong>.
          Gemini AI parses biomarkers in the background and flags uncertain numbers for review.
        </p>

        {errorMsg && (
          <div className="mt-5 p-4 rounded-2xl bg-rose-50 text-rose-700 text-sm">
            {errorMsg}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf,text/plain"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-6 w-full py-12 px-6 rounded-3xl bg-[#F4F6F8] hover:bg-emerald-50/50 border-2 border-dashed border-gray-200 hover:border-emerald-400 transition-all text-center cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto text-emerald-600 group-hover:scale-105 transition-transform">
            <Upload className="w-5 h-5" />
          </div>
          <p className="mt-4 font-display text-base font-semibold text-gray-900">
            Choose a lab report image or PDF
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Supports PNG, JPG, WebP, PDF, or plain-text lab exports
          </p>
        </button>

        {/* Quick Sample Lab Reports for instant evaluation */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-3">
            Or test Gemini AI extraction with a sample lab sheet
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SAMPLE_LAB_REPORTS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleUseSample(sample.id)}
                className="p-4 rounded-2xl bg-[#F4F6F8] hover:bg-emerald-50/60 text-left transition-colors cursor-pointer flex items-start gap-3"
              >
                <FileText className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {sample.title}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">{sample.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
