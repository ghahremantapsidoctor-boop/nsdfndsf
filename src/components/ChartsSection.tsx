import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  Users, 
  Filter, 
  BarChart3, 
  Info,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { DailyMarketingRecord, MonthlyMarketingPlan } from '../types/marketing';
import { formatCompactToman, formatCurrencyIRT, formatPercent, toPersianDigits } from '../utils/formatters';

interface ChartsSectionProps {
  records: DailyMarketingRecord[];
  monthlyPlan: MonthlyMarketingPlan;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ records, monthlyPlan }) => {
  const [activeTab, setActiveTab] = useState<'gmv_orders' | 'spend_channels' | 'cac_cpo' | 'funnel'>('gmv_orders');

  // Chart Data preparation
  const chartData = records.map((r) => ({
    name: `روز ${toPersianDigits(r.dayNumber)}`,
    dayNum: r.dayNumber,
    dayName: r.dayName,
    dateStr: r.dateStr,
    totalGmv: Math.round(r.totalGmv / 1000000), // in Millions for cleaner axis
    targetGmv: Math.round(r.targetGmv / 1000000),
    totalOrder: r.totalOrder,
    targetOrder: r.targetOrder,
    orderOms: r.orderOms,
    orderOcs: r.orderOcs,
    orderCampaign: r.orderCampaignLaghari + r.orderCampaignClinic,
    totalSpend: Math.round(r.totalMarketingCostPlusVoucher / 1000000),
    acqSpend: Math.round(r.totalAcquisitionCost / 1000000),
    retentionSpend: Math.round(r.totalRetention / 1000000),
    voucherSpend: Math.round(r.totalVoucher / 1000000),
    cac: r.cacAcquisitionOnly,
    targetCac: monthlyPlan.targetCac,
    cpo: r.cpoMediaOnly,
    cpl: r.cpl,
    cpa: r.cpa,
    leads: r.leads,
    logins: r.logins,
    newUsers: r.newUserOverall,
    cr1: r.cr1,
    cr2: r.cr2,
  }));

  // Aggregated Channel Spend for Pie Chart
  const totalDigipay = records.reduce((s, r) => s + r.acqBnplDigipay, 0);
  const totalSmsNew = records.reduce((s, r) => s + r.acqSmsJourneyNewSegment, 0);
  const totalGoogleAds = records.reduce((s, r) => s + r.acqGoogleAdsTomans, 0);
  const totalAdServiceTpdr = records.reduce((s, r) => s + r.acqAdServiceTpdr, 0);
  const totalInfluencer = records.reduce((s, r) => s + r.acqInfluencer, 0);
  const totalVouchers = records.reduce((s, r) => s + r.totalVoucher, 0);
  const totalRetention = records.reduce((s, r) => s + r.totalRetention, 0);
  const totalCampaignTags = records.reduce((s, r) => s + r.acqCampaignTag, 0);

  const channelSpendPie = [
    { name: 'اس‌ام‌اس جرنی کاربری (E-CRM)', value: totalSmsNew, color: '#10b981' },
    { name: 'اد سرویس دیجی‌پی (DigiPay)', value: totalDigipay, color: '#3b82f6' },
    { name: 'کدهای تخفیف (Voucher)', value: totalVouchers, color: '#f59e0b' },
    { name: 'تبلیغات گوگل (Google Ads)', value: totalGoogleAds, color: '#8b5cf6' },
    { name: 'اد سرویس اختصاصی تپسی دکتر', value: totalAdServiceTpdr, color: '#06b6d4' },
    { name: 'اینفلوئنسر مارکتینگ', value: totalInfluencer, color: '#ec4899' },
    { name: 'ریتنشن و ریتارگتینگ (یکتانت/تپسل)', value: totalRetention, color: '#64748b' },
    { name: 'تگ‌های اختصاصی کمپین', value: totalCampaignTags, color: '#14b8a6' },
  ].filter((item) => item.value > 0);

  // Overall Funnel Aggregates
  const funnelLeads = records.reduce((s, r) => s + r.leads, 0);
  const funnelLogins = records.reduce((s, r) => s + r.logins, 0);
  const funnelOrders = records.reduce((s, r) => s + r.totalOrder, 0);
  const funnelNewUsers = records.reduce((s, r) => s + r.newUserOverall, 0);

  const funnelSteps = [
    { title: 'ورودی بالای قیف (Top of Funnel Leads - DAU)', count: funnelLeads, dropRate: '۱۰۰٪', color: 'from-blue-600 to-cyan-500' },
    { title: 'ورود به اپلیکیشن و وب (Logins - First)', count: funnelLogins, dropRate: `${toPersianDigits(((funnelLogins / (funnelLeads || 1)) * 100).toFixed(1))}٪ از لیدها`, color: 'from-cyan-500 to-teal-500' },
    { title: 'سفارش‌های نهایی ثبت‌شده (Total Orders)', count: funnelOrders, dropRate: `CR2: ${toPersianDigits(((funnelOrders / (funnelLogins || 1)) * 100).toFixed(1))}٪ از لاگین‌ها`, color: 'from-teal-500 to-emerald-500' },
    { title: 'کاربران جدید خرید اولی (New Users Overall)', count: funnelNewUsers, dropRate: `${toPersianDigits(((funnelNewUsers / (funnelOrders || 1)) * 100).toFixed(1))}٪ از سفارش‌ها`, color: 'from-emerald-500 to-green-500' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
      
      {/* Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('gmv_orders')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'gmv_orders'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>فروش و سفارش‌ها (GMV & Orders)</span>
          </button>

          <button
            onClick={() => setActiveTab('spend_channels')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'spend_channels'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>بودجه و کانال‌ها (Spend & Channels)</span>
          </button>

          <button
            onClick={() => setActiveTab('cac_cpo')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'cac_cpo'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>شاخص‌های CAC و CPO</span>
          </button>

          <button
            onClick={() => setActiveTab('funnel')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'funnel'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>قیف بازاریابی و تبدیل (Funnel)</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 self-end sm:self-auto">
          <Info className="w-3.5 h-3.5 text-teal-400" />
          <span>تعداد روزهای نمایش‌یافته: {toPersianDigits(records.length)} روز</span>
        </div>
      </div>

      {/* Tab 1: GMV & Orders */}
      {activeTab === 'gmv_orders' && (
        <div className="space-y-6">
          {/* GMV Area Chart */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  روند فروش روزانه GMV در برابر تارگت
                </h4>
                <p className="text-xs text-slate-400">مقادیر بر حسب میلیون تومان / ریال</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
                  GMV محقق‌شده
                </span>
                <span className="flex items-center gap-1.5 text-blue-400">
                  <span className="w-3 h-1.5 rounded bg-blue-400 inline-block"></span>
                  تارگت روزانه
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => toPersianDigits(v)} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(val: any, name: any) => [
                      `${formatCompactToman(Number(val || 0) * 1000000)}`,
                      name === 'totalGmv' ? 'GMV محقق' : 'تارگت روزانه'
                    ]}
                    labelFormatter={(label) => `تاریخ: ${label}`}
                  />
                  <Area type="monotone" dataKey="totalGmv" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#gmvGrad)" name="totalGmv" />
                  <Line type="monotone" dataKey="targetGmv" stroke="#60a5fa" strokeWidth={2} strokeDasharray="4 4" dot={false} name="targetGmv" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders Stacked Bar Chart */}
          <div className="pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-white">تفکیک سفارش‌های روزانه بر اساس منبع</h4>
                <p className="text-xs text-slate-400">سفارش‌های تأمین‌کننده (OMS)، تعرفه (OCS) و لندینگ کمپین‌ها</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-teal-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-teal-500"></span> OMS
                </span>
                <span className="flex items-center gap-1 text-blue-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span> OCS
                </span>
                <span className="flex items-center gap-1 text-purple-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-purple-500"></span> کمپین‌ها
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => toPersianDigits(v)} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(val: any, name: any) => [
                      toPersianDigits(val || 0) + ' سفارش',
                      name === 'orderOms' ? 'OMS (تأمین‌کننده)' : name === 'orderOcs' ? 'OCS (تعرفه)' : 'کمپین‌ها (لاغری/کلینیک)'
                    ]}
                  />
                  <Bar dataKey="orderOms" stackId="a" fill="#14b8a6" radius={[0, 0, 0, 0]} name="orderOms" />
                  <Bar dataKey="orderOcs" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} name="orderOcs" />
                  <Bar dataKey="orderCampaign" stackId="a" fill="#a855f7" radius={[4, 4, 0, 0]} name="orderCampaign" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Budget & Channels */}
      {activeTab === 'spend_channels' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Pie Chart */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <h4 className="text-sm font-bold text-white mb-1">سهم هزینه‌کرد کانال‌ها در بازه</h4>
            <p className="text-xs text-slate-400 mb-4">کل بودجه مصرفی: {formatCompactToman(records.reduce((s, r) => s + r.totalMarketingCostPlusVoucher, 0))}</p>
            
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelSpendPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {channelSpendPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(val: any) => [`${formatCompactToman(Number(val || 0))} تومان/ریال`, 'هزینه کانال']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdown Table & Share List */}
          <div className="lg:col-span-7 space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">جزییات مبالغ مصرفی کانال‌ها</h4>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {channelSpendPie.map((item, idx) => {
                const total = records.reduce((s, r) => s + r.totalMarketingCostPlusVoucher, 0);
                const percent = total > 0 ? (item.value / total) * 100 : 0;
                return (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                      <span className="font-medium text-slate-200">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-300">{formatCompactToman(item.value)}</span>
                      <span className="w-12 text-left font-mono text-emerald-400 font-semibold">{toPersianDigits(percent.toFixed(1))}٪</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Tab 3: CAC & CPO Trends */}
      {activeTab === 'cac_cpo' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div>
              <h4 className="text-sm font-bold text-white">روند تغییرات هزینه جذب کاربر جدید (CAC) و سفارش (CPO)</h4>
              <p className="text-xs text-slate-400">مقایسه عملکرد روزانه با تارگت مصوب ۹۰۸,۰۱۳ ریال/تومان</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> CAC واقعی
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-1 rounded bg-emerald-500"></span> تارگت CAC (۹۰۸k)
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> CPO سفارش
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => toPersianDigits(Math.round(v / 1000) + 'k')} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any, name: any) => [
                    `${formatCurrencyIRT(Number(val || 0))}`,
                    name === 'cac' ? 'CAC کاربر جدید' : name === 'targetCac' ? 'تارگت CAC' : name === 'cpo' ? 'CPO سفارش' : 'CPL'
                  ]}
                />
                <Line type="monotone" dataKey="cac" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 3 }} name="cac" />
                <Line type="monotone" dataKey="targetCac" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} name="targetCac" />
                <Line type="monotone" dataKey="cpo" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} name="cpo" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* CPL & CPA summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">میانگین هزینه لید (CPL):</span>
              <span className="text-base font-bold text-white">
                {formatCompactToman(Math.round(records.reduce((s, r) => s + r.cpl, 0) / (records.length || 1)))}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">میانگین هزینه لاگین (CPA):</span>
              <span className="text-base font-bold text-white">
                {formatCompactToman(Math.round(records.reduce((s, r) => s + r.cpa, 0) / (records.length || 1)))}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">میانگین CPO با ووچر:</span>
              <span className="text-base font-bold text-white">
                {formatCompactToman(Math.round(records.reduce((s, r) => s + r.cpoMediaPlusVoucher, 0) / (records.length || 1)))}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">تعداد جذب کاربر جدید:</span>
              <span className="text-base font-bold text-emerald-400">
                {formatCurrencyIRT(records.reduce((s, r) => s + r.newUserOverall, 0))} کاربر
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Funnel & Conversion Rates */}
      {activeTab === 'funnel' && (
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-bold text-white mb-1">قیف کامل بازاریابی تپسی دکتر (Marketing Funnel Flow)</h4>
            <p className="text-xs text-slate-400 mb-6">از اولین ارتباط و کاربران فعال تا ثبت سفارش نهایی و کاربر اولی</p>
            
            <div className="space-y-4 max-w-3xl mx-auto">
              {funnelSteps.map((step, idx) => {
                const max = funnelLeads || 1;
                const widthPercent = Math.max(25, (step.count / max) * 100);
                return (
                  <div key={idx} className="relative">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-200">{step.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">{formatCurrencyIRT(step.count)}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {step.dropRate}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-950 rounded-xl h-9 p-1 border border-slate-800/80">
                      <div 
                        className={`h-full rounded-lg bg-gradient-to-r ${step.color} transition-all duration-700 flex items-center justify-end px-3 shadow-sm`}
                        style={{ width: `${widthPercent}%` }}
                      >
                        <span className="text-[10px] font-bold text-slate-950 font-mono">
                          {toPersianDigits(widthPercent.toFixed(1))}٪
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CR1 & CR2 Trend Chart */}
          <div className="pt-6 border-t border-slate-800">
            <h4 className="text-sm font-bold text-white mb-1">روند روزانه نرخ تبدیل CR1 و CR2</h4>
            <p className="text-xs text-slate-400 mb-4">CR1: لید به سفارش • CR2: لاگین اول به سفارش</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => toPersianDigits(v + '٪')} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(val: any, name: any) => [
                      `${toPersianDigits(Number(val || 0).toFixed(2))}٪`,
                      name === 'cr2' ? 'CR2 (سفارش / لاگین)' : 'CR1 (سفارش / لید)'
                    ]}
                  />
                  <Line type="monotone" dataKey="cr2" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} name="cr2" />
                  <Line type="monotone" dataKey="cr1" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="cr1" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
