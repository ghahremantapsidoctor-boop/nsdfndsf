import React, { useState } from 'react';
import { 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { TrendAlert, AlertSeverity } from '../types/marketing';
import { toPersianDigits, formatPercent } from '../utils/formatters';

interface TrendAlertBannerProps {
  alerts: TrendAlert[];
  latestGmvDropPercent?: number;
}

export const TrendAlertBanner: React.FC<TrendAlertBannerProps> = ({ alerts, latestGmvDropPercent }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'positive'>('all');

  if (alerts.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3.5 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>سیستم پایش روند هوشمند (Trend Alert): نوسان غیرعادی بیش از ۲۰٪ در روزهای انتخاب‌شده شناسایی نشد.</span>
        </div>
        <span className="text-[11px] text-emerald-400 font-medium px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 font-mono">
          وضعیت نرمال
        </span>
      </div>
    );
  }

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const positiveCount = alerts.filter((a) => a.severity === 'positive').length;

  const filteredAlerts = alerts.filter((a) => {
    if (activeFilter === 'critical') return a.severity === 'critical';
    if (activeFilter === 'positive') return a.severity === 'positive';
    return true;
  });

  return (
    <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl overflow-hidden transition-all">
      
      {/* Banner Top Header */}
      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg ${
              criticalCount > 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {criticalCount > 0 ? <AlertTriangle className="w-5 h-5 animate-pulse" /> : <Sparkles className="w-5 h-5" />}
            </div>
            {criticalCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping"></span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                سیستم هشدار هوشمند نوسان روند (Trend Alert Engine)
              </h4>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                {toPersianDigits(criticalCount)} هشدار افت شدید (۲۰٪-)
              </span>
              {positiveCount > 0 && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {toPersianDigits(positiveCount)} جهش رشد
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              تحلیل خودکار نوسانات روزبه‌روز شیت مارکتینگ و شناسایی افت‌های شدید فروش یا جهش‌های هزینه
            </p>
          </div>
        </div>

        {/* Filter Badges & Toggle Button */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeFilter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              همه ({toPersianDigits(alerts.length)})
            </button>
            <button
              onClick={() => setActiveFilter('critical')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                activeFilter === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold' : 'text-rose-400 hover:text-rose-300'
              }`}
            >
              <TrendingDown className="w-3 h-3" />
              <span>افت‌های شدید</span>
            </button>
            {positiveCount > 0 && (
              <button
                onClick={() => setActiveFilter('positive')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  activeFilter === 'positive' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold' : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                <span>جهش‌های مثبت</span>
              </button>
            )}
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
            title={isExpanded ? 'بستن جزییات' : 'مشاهده جزییات'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Alert Cards Grid */}
      {isExpanded && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredAlerts.map((alert) => {
            const isDrop = alert.type === 'drop';
            const isSpike = alert.type === 'spike';
            const isSurge = alert.type === 'surge';

            let badgeStyle = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
            let cardBorder = 'border-rose-500/30 hover:border-rose-500/60';
            if (isSpike) {
              badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
              cardBorder = 'border-emerald-500/30 hover:border-emerald-500/60';
            } else if (isSurge) {
              badgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
              cardBorder = 'border-amber-500/30 hover:border-amber-500/60';
            }

            return (
              <div
                key={alert.id}
                className={`p-3.5 rounded-2xl bg-slate-950/80 border ${cardBorder} shadow-sm space-y-2.5 transition-all`}
              >
                {/* Alert Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${badgeStyle}`}>
                      {isDrop && `افت ${toPersianDigits(Math.abs(alert.percentChange))}٪`}
                      {isSpike && `رشد +${toPersianDigits(alert.percentChange)}٪`}
                      {isSurge && `جهش CAC`}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      روز {toPersianDigits(alert.dayNumber)} ({alert.dateStr.split(' ')[0]})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {alert.metricTitle}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h5 className="text-xs font-bold text-white leading-snug">
                    {alert.title}
                  </h5>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {alert.description}
                  </p>
                </div>

                {/* Recommendation pill if present */}
                {alert.recommendation && (
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-300 space-y-0.5">
                    <span className="font-semibold text-emerald-400 block">اقدام پیشنهادی:</span>
                    <p className="text-slate-400">{alert.recommendation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
