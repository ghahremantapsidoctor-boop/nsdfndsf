import React from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  CreditCard, 
  Users, 
  Target, 
  Percent, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Zap,
  AlertTriangle,
  TrendingDown
} from 'lucide-react';
import { DailyMarketingRecord, MonthlyMarketingPlan, TrendAlert } from '../types/marketing';
import { formatCurrencyIRT, formatCompactToman, formatPercent, toPersianDigits } from '../utils/formatters';
import { getLatestDayDelta } from '../utils/trendDetector';
import { TrendAlertBanner } from './TrendAlertBanner';

interface KpiCardsProps {
  records: DailyMarketingRecord[];
  monthlyPlan: MonthlyMarketingPlan;
  campaignFilter: string;
  alerts: TrendAlert[];
}

export const KpiCards: React.FC<KpiCardsProps> = ({ 
  records, 
  monthlyPlan, 
  campaignFilter,
  alerts 
}) => {
  // Aggregate metrics across the active filtered records
  const totalOrders = records.reduce((sum, r) => {
    if (campaignFilter === 'laghari') return sum + r.orderCampaignLaghari;
    if (campaignFilter === 'clinic') return sum + r.orderCampaignClinic;
    return sum + r.totalOrder;
  }, 0);

  const totalGmv = records.reduce((sum, r) => {
    if (campaignFilter === 'laghari') return sum + r.gmvCampaignLaghari;
    if (campaignFilter === 'clinic') return sum + r.gmvCampaignClinic;
    return sum + r.totalGmv;
  }, 0);

  const totalTargetGmv = records.reduce((sum, r) => sum + r.targetGmv, 0);
  const totalTargetOrders = records.reduce((sum, r) => sum + r.targetOrder, 0);

  const totalVoucher = records.reduce((sum, r) => sum + r.totalVoucher, 0);
  const totalRetention = records.reduce((sum, r) => sum + r.totalRetention, 0);
  const totalAcquisition = records.reduce((sum, r) => sum + r.totalAcquisitionCost, 0);
  const totalMarketingBudget = totalAcquisition + totalRetention + totalVoucher;

  const totalNewUsers = records.reduce((sum, r) => sum + r.newUserOverall, 0);
  const totalLeads = records.reduce((sum, r) => sum + r.leads, 0);
  const totalLogins = records.reduce((sum, r) => sum + r.logins, 0);

  // Calculated ratios
  const gmvAchievedPercent = totalTargetGmv > 0 ? (totalGmv / totalTargetGmv) * 100 : 0;
  const orderAchievedPercent = totalTargetOrders > 0 ? (totalOrders / totalTargetOrders) * 100 : 0;
  const blendedCac = totalNewUsers > 0 ? Math.round(totalAcquisition / totalNewUsers) : 0;
  const blendedCpo = totalOrders > 0 ? Math.round((totalAcquisition + totalRetention) / totalOrders) : 0;
  const overallCr1 = totalLeads > 0 ? (totalOrders / totalLeads) * 100 : 0;
  const overallCr2 = totalLogins > 0 ? (totalOrders / totalLogins) * 100 : 0;
  const blendedAov = totalOrders > 0 ? Math.round(totalGmv / totalOrders) : 0;

  // Comparison with month target
  const cacTarget = monthlyPlan.targetCac;
  const isCacEfficient = blendedCac <= cacTarget;

  // Calculate day-over-day delta for highlighting alerts on cards
  const delta = getLatestDayDelta(records);
  const isGmvSignificantDrop = delta.gmvChangePercent <= -20;
  const isGmvSpike = delta.gmvChangePercent >= 20;

  return (
    <div className="space-y-4">
      
      {/* 1. Trend Alert Banner */}
      <TrendAlertBanner 
        alerts={alerts} 
        latestGmvDropPercent={delta.gmvChangePercent} 
      />

      {/* 2. Main Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. GMV Achieved */}
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/90 border p-5 shadow-lg group transition-all ${
          isGmvSignificantDrop
            ? 'border-rose-500/50 shadow-rose-950/30'
            : isGmvSpike
            ? 'border-emerald-500/50 shadow-emerald-950/30'
            : 'border-slate-800 hover:border-emerald-500/40'
        }`}>
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">فروش ناخالص کل (GMV)</span>
            
            {/* Highlighted Trend Badge */}
            {delta.previousDay && (
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-mono flex items-center gap-1 border ${
                isGmvSignificantDrop
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                  : delta.gmvChangePercent < 0
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              }`}>
                {delta.gmvChangePercent < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                <span>{toPersianDigits(Math.abs(delta.gmvChangePercent))}%</span>
                {isGmvSignificantDrop && <span className="text-[10px] mr-0.5">افت شدید</span>}
              </span>
            )}

            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <h3 className="text-2xl font-black text-white tracking-tight">
              {formatCompactToman(totalGmv)}
            </h3>
            <span className="text-xs text-slate-400">تومان / ریال</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">تحقق از تارگت بازه:</span>
              <span className={`font-bold flex items-center gap-0.5 ${gmvAchievedPercent >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {formatPercent(gmvAchievedPercent)}
                {gmvAchievedPercent >= 100 ? <ArrowUpRight className="w-3.5 h-3.5" /> : null}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${gmvAchievedPercent >= 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(gmvAchievedPercent, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 flex items-center justify-between pt-0.5">
              <span>تارگت بازه: {formatCompactToman(totalTargetGmv)}</span>
              <span>AOV: {formatCompactToman(blendedAov)}</span>
            </p>
          </div>
        </div>

        {/* 2. Total Orders */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 p-5 shadow-lg group hover:border-blue-500/40 transition-all">
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">تعداد کل سفارش‌ها (Orders)</span>
            
            {/* Highlighted DoD Order Badge */}
            {delta.previousDay && (
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono flex items-center gap-1 border ${
                delta.ordersChangePercent < -15
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  : delta.ordersChangePercent < 0
                  ? 'bg-slate-800 text-slate-300 border-slate-700'
                  : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
              }`}>
                <span>{toPersianDigits(delta.ordersChangePercent)}% DoD</span>
              </span>
            )}

            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <h3 className="text-2xl font-black text-white tracking-tight">
              {formatCurrencyIRT(totalOrders)}
            </h3>
            <span className="text-xs text-slate-400">سفارش ثبت‌شده</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">تحقق تارگت سفارش:</span>
              <span className="font-bold text-blue-400">
                {formatPercent(orderAchievedPercent)}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(orderAchievedPercent, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 flex items-center justify-between pt-0.5">
              <span>تارگت سفارش بازه: {formatCurrencyIRT(totalTargetOrders)}</span>
              <span>تارگت کل آبان: {formatCurrencyIRT(monthlyPlan.targetOrder)}</span>
            </p>
          </div>
        </div>

        {/* 3. Blended CAC (Cost per New User) */}
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/90 border p-5 shadow-lg group transition-all ${
          !isCacEfficient && blendedCac > cacTarget * 1.8
            ? 'border-amber-500/40 shadow-amber-950/20'
            : 'border-slate-800 hover:border-purple-500/40'
        }`}>
          <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">هزینه جذب کاربر جدید (CAC)</span>
            
            {/* Target CAC Comparison Badge */}
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border font-mono ${
              isCacEfficient
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}>
              {isCacEfficient ? 'مطلوب (زیر تارگت)' : `${toPersianDigits(((blendedCac / cacTarget)).toFixed(1))}x تارگت`}
            </span>

            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <h3 className="text-2xl font-black text-white tracking-tight">
              {formatCompactToman(blendedCac)}
            </h3>
            <span className="text-xs text-slate-400">به‌ازای هر کاربر</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">تارگت مصوب CAC:</span>
              <span className={`font-bold flex items-center gap-1 ${isCacEfficient ? 'text-emerald-400' : 'text-amber-400'}`}>
                {formatCompactToman(cacTarget)}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${isCacEfficient ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min((blendedCac / (cacTarget * 1.5)) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 flex items-center justify-between pt-0.5">
              <span>جذب کل کاربران جدید: {formatCurrencyIRT(totalNewUsers)}</span>
              <span>CPO میانگین: {formatCompactToman(blendedCpo)}</span>
            </p>
          </div>
        </div>

        {/* 4. Total Marketing Budget & CR */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 p-5 shadow-lg group hover:border-amber-500/40 transition-all">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">کل بودجه مارکتینگ + ووچر</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <h3 className="text-2xl font-black text-white tracking-tight">
              {formatCompactToman(totalMarketingBudget)}
            </h3>
            <span className="text-xs text-slate-400">هزینه‌شده</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">نرخ تبدیل نهایی (CR2):</span>
              <span className="font-bold text-amber-400">
                {formatPercent(overallCr2)} (سفارش / لاگین)
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(overallCr2 * 3.5, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 flex items-center justify-between pt-0.5">
              <span>سهم ووچر و تخفیف: {formatCompactToman(totalVoucher)}</span>
              <span>CR1 (لید به سفارش): {formatPercent(overallCr1)}</span>
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
