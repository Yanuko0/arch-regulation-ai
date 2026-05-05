// components/features/FloorRatioCalculator/FloorRatioCalculator.tsx
'use client';
import { useState } from 'react';
import { Calculator, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CitationAccordion } from '@/components/ui/CitationAccordion/CitationAccordion';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner/DisclaimerBanner';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator/LoadingIndicator';
import { getDisclaimerText } from '@/lib/utils/promptBuilder';
import type { Citation } from '@/types/chat.types';

interface CalculatorLabels {
  title?: string;
  desc?: string;
  question?: string;
  questionPlaceholder?: string;
  landArea?: string;
  landAreaPlaceholder?: string;
  zoneType?: string;
  zoneTypePlaceholder?: string;
  buildingUsage?: string;
  buildingUsagePlaceholder?: string;
  calculate?: string;
  calculating?: string;
  result?: string;
  noResult?: string;
  disclaimer?: string;
  viewSource?: string;
}

interface FloorRatioCalculatorProps {
  regionCode: string;
  subRegion?: string;
  locale?: string;
  sessionId?: string | null;
  guestId?: string | null;
  labels?: CalculatorLabels;
  onClose?: () => void;
}

export function FloorRatioCalculator({
  regionCode,
  subRegion,
  locale = 'zh-TW',
  sessionId,
  guestId,
  labels,
  onClose,
}: FloorRatioCalculatorProps) {
  const [question, setQuestion] = useState('');
  const [landArea, setLandArea] = useState('');
  const [zoneType, setZoneType] = useState('');
  const [buildingUsage, setBuildingUsage] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setCitations([]);

    try {
      const res = await fetch('/api/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          regionCode,
          subRegion,
          locale,
          sessionId,
          guestId,
          structuredInput: {
            landArea: landArea ? parseFloat(landArea) : undefined,
            zoneType: zoneType || undefined,
            buildingUsage: buildingUsage || undefined,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data.answer);
        setCitations(data.data.citations ?? []);
      } else {
        setError(data.details ? `${data.error}: ${data.details}` : (data.error ?? 'CALCULATOR_ERROR'));
      }
    } catch {
      setError('NETWORK_ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <Calculator size={15} className="text-amber-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-100">
              {labels?.title ?? '建蔽率 / 容積率試算'}
            </div>
            <div className="text-[10px] text-slate-500">
              {labels?.desc ?? 'AI 從法規原文推理計算'}
            </div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="btn-ghost w-7 h-7 p-0 justify-center rounded-lg">
            <X size={14} />
          </button>
        )}
      </div>

      {/* 輸入區 */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* 主要問題 */}
        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">
            {labels?.question ?? '查詢問題'} <span className="text-amber-500">*</span>
          </label>
          <textarea
            id="calculator-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={2}
            placeholder={labels?.questionPlaceholder ?? '例：第二種住宅區 500 m² 的建蔽率與容積率？'}
            className="input-field text-sm"
          />
        </div>

        {/* 輔助欄位 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">
              {labels?.landArea ?? '基地面積（m²）'}
            </label>
            <input
              id="calculator-land-area"
              type="number"
              value={landArea}
              onChange={(e) => setLandArea(e.target.value)}
              placeholder={labels?.landAreaPlaceholder ?? '例：500'}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">
              {labels?.zoneType ?? '用地分區'}
            </label>
            <input
              id="calculator-zone-type"
              value={zoneType}
              onChange={(e) => setZoneType(e.target.value)}
              placeholder={labels?.zoneTypePlaceholder ?? '例：第二種住宅區'}
              className="input-field text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1.5">
            {labels?.buildingUsage ?? '建築用途'}
          </label>
          <input
            id="calculator-building-usage"
            value={buildingUsage}
            onChange={(e) => setBuildingUsage(e.target.value)}
            placeholder={labels?.buildingUsagePlaceholder ?? '例：住宅'}
            className="input-field text-sm"
          />
        </div>

        <button
          id="calculator-submit-btn"
          onClick={handleCalculate}
          disabled={loading || !question.trim()}
          className="btn-accent w-full justify-center"
        >
          {loading ? (
            <>
              <LoadingIndicator size="sm" />
              {labels?.calculating ?? 'AI 試算中...'}
            </>
          ) : (
            <>
              <Calculator size={15} />
              {labels?.calculate ?? '開始試算'}
            </>
          )}
        </button>

        {/* 錯誤 */}
        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            ⚠️ {error === 'NETWORK_ERROR' ? '網路錯誤，請稍後再試' : `發生錯誤：${error}`}
          </div>
        )}

        {/* 結果區 */}
        {result && (
          <div className="space-y-3 animate-fade-in-up">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {labels?.result ?? '試算結果'}
            </div>
            <div className="glass-card p-4 text-sm">
              <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              </div>
            </div>
            {citations.length > 0 && (
              <CitationAccordion 
                citations={citations} 
                labels={{
                  title: labels?.result ? `${labels.result} - ${labels.question}` : undefined,
                  viewSource: labels?.viewSource
                }} 
              />
            )}
            <DisclaimerBanner
              content={labels?.disclaimer ?? getDisclaimerText(locale)}
              compact
            />
          </div>
        )}

        {!result && !loading && (
          <div className="text-center text-xs text-slate-600 py-4">
            {labels?.noResult ?? '請輸入問題後點擊試算'}
          </div>
        )}
      </div>
    </div>
  );
}
