import React from 'react';
import { Target, CalendarCheck, BarChart3, Layers, CheckCircle2 } from 'lucide-react';
import { DailyMarketingRecord, MonthlyMarketingPlan } from '../types/marketing';
import { formatCompactToman, formatCurrencyIRT, formatPercent, toPersianDigits } from '../utils/formatters';

interface TargetProgressCardProps {
  monthlyPlan: MonthlyMarketingPlan;
  records: DailyMarketingRecord[];
}

export const TargetProgressCard: React.FC<TargetProgressCardProps> = ({ monthlyPlan, records }) => {
  const totalAchievedGmv = records.reduce((s, r) => s + r.totalGmv, 0);
  const totalAchievedOrders = records.reduce((s, r) => s + r.totalOrder, 0);
  const totalAchievedBudget = records.reduce((s, r) => s + r.totalMarketingCostPlusVoucher, 0);

  const gmvPercent = (totalAchievedGmv / monthlyPlan.targetGmv) * 100;
  const orderPercent = (totalAchievedOrders / monthlyPlan.targetOrder) * 100;
  const budgetPercent = (totalAchievedBudget / monthlyPlan.targetMarketingBudget) * 100;

  // Compute weekly actuals
  const weeklyActuals = monthlyPlan.weeklyPlans.map((wp, index) => {
    let weekRecords: DailyMarketingRecord[] = [];
    if (index === 0) weekRecords = records.filter((r) => r.dayNumber === 1);
    else if (index === 1) weekRecords = records.filter((r) => r.dayNumber >= 2 && r.dayNumber <= 8);
    else if (index === 2) weekRecords = records.filter((r) => r.dayNumber >= 9 && r.dayNumber <= 15);
    else if (index === 3) weekRecords = records.filter((r) => r.dayNumber >= 16 && r.dayNumber <= 22);
    else weekRecords = records.filter((r) => r.dayNumber >= 23 && r.dayNumber <= 30);

    const actualOrders = weekRecords.reduce((s, r) => s + r.totalOrder, 0);
    const actualGmv = weekRecords.reduce((s, r) => s + r.totalGmv, 0);
    const orderP = wp.targetOrder > 0 ? (actualOrders / wp.targetOrder) * 100 : 0;
    const gmvP = wp.targetGmv > 0 ? (actualGmv / wp.targetGmv) * 100 : 0;

    return {
      ...wp,
      actualOrders,
      actualGmv,
      orderP,
      gmvP,
    };
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              برنامه و تحقق تارگت ماهانه آبان ۱۴۰۵
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-normal">
                پلن رسمی تپسی دکتر
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              هدف کل ماه: {formatCompactToman(monthlyPlan.targetGmv)} GMV • {formatCurrencyIRT(monthlyPlan.targetOrder)} سفارش • بودجه {formatCompactToman(monthlyPlan.targetMarketingBudget)}
            </p>
          </div>
        </div>

        {/* Global Progress Indicators */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">تحقق GMV:</span>
            <span className="font-bold text-emerald-400">{formatPercent(gmvPercent)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">تحقق سفارش:</span>
            <span className="font-bold text-blue-400">{formatPercent(orderPercent)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">مصرف بودجه:</span>
            <span className="font-bold text-amber-400">{formatPercent(budgetPercent)}</span>
          </div>
        </div>
      </div>

      {/* Weekly Progress Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        {weeklyActuals.map((w, idx) => (
          <div 
            key={idx}
            className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3 hover:border-slate-700 transition-all"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-200">{w.week}</span>
              <span className="text-[10px] text-slate-400 font-mono">{w.daysRange}</span>
            </div>
            
            {/* Orders */}
            <div className="flex items-baseline justify-between text-xs mb-1">
              <span className="text-slate-400">سفارش:</span>
              <span className="font-bold text-blue-300">
                {formatCurrencyIRT(w.actualOrders)} / {formatCurrencyIRT(w.targetOrder)}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden mb-2">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${w.orderP >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(w.orderP, 100)}%` }}
              />
            </div>

            {/* GMV */}
            <div className="flex items-baseline justify-between text-[11px] mb-1">
              <span className="text-slate-400">فروش:</span>
              <span className="font-bold text-emerald-300">
                {w.actualGmv > 0 ? formatCompactToman(w.actualGmv) : '-'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
              <span>تحقق GMV:</span>
              {w.actualGmv > 0 ? (
                <span className={`font-semibold ${w.gmvP >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {formatPercent(w.gmvP)}
                </span>
              ) : (
                <span className="text-slate-500 font-mono text-[9px]">در انتظار ثبت دیتا</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Channel Allocation Target Shares */}
      <div className="pt-3 border-t border-slate-800/60">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-xs font-semibold text-slate-300">سهم کانال‌های بازاریابی از تارگت سفارش‌ها:</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {monthlyPlan.channelShares.filter(c => c.targetOrders > 0).map((ch, idx) => (
            <div key={idx} className="px-3 py-2 rounded-xl bg-slate-800/40 border border-slate-800 text-xs">
              <div className="flex items-center justify-between text-slate-300 font-medium mb-1">
                <span className="truncate">{ch.channel.split('(')[0]}</span>
                <span className="text-emerald-400 font-bold">{toPersianDigits(ch.sharePercent)}٪</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>تارگت سفارش:</span>
                <span className="font-mono text-slate-200">{formatCurrencyIRT(ch.targetOrders)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
