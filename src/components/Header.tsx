import React from 'react';
import { 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  Settings, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  FileCode2,
  LogOut,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
import { AppUser, SheetConnectionConfig } from '../types/marketing';
import { toPersianDigits } from '../utils/formatters';

interface HeaderProps {
  currentUser: AppUser | null;
  sheetConfig: SheetConnectionConfig;
  onRefreshData: () => void;
  isSyncing: boolean;
  selectedRange: string;
  onSelectRange: (range: string) => void;
  selectedCampaign: string;
  onSelectCampaign: (camp: string) => void;
  recordedDaysCount: number;
  criticalAlertsCount: number;
  onlyRecordedDays: boolean;
  onToggleOnlyRecordedDays: () => void;
  onOpenAdmin: () => void;
  onOpenExportGuide: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  sheetConfig,
  onRefreshData,
  isSyncing,
  selectedRange,
  onSelectRange,
  selectedCampaign,
  onSelectCampaign,
  recordedDaysCount,
  criticalAlertsCount,
  onlyRecordedDays,
  onToggleOnlyRecordedDays,
  onOpenAdmin,
  onOpenExportGuide,
  onOpenAuthModal,
  onLogout,
}) => {
  const quickRanges = onlyRecordedDays
    ? [
        { id: 'all', label: `روزهای ثبت‌شده (${toPersianDigits(recordedDaysCount)} روز)` },
        { id: 'w1', label: 'روز ۱' },
        { id: 'w2', label: 'روزهای ۲ تا ۷' },
        { id: 'last3', label: '۳ روز اخیر' },
      ]
    : [
        { id: 'all', label: 'تمام آبان (۳۰ روز)' },
        { id: 'w1', label: 'هفته ۱' },
        { id: 'w2', label: 'هفته ۲ (روز ۲-۸)' },
        { id: 'w3', label: 'هفته ۳' },
        { id: 'w4', label: 'هفته ۴' },
        { id: 'w5', label: 'هفته ۵' },
        { id: 'last3', label: '۳ روز اخیر' },
        { id: 'last7', label: '۷ روز اخیر' },
      ];

  const campaignOptions = [
    { id: 'all', label: 'همه کانال‌ها و کمپین‌ها' },
    { id: 'ecrm', label: 'کمپین‌های E-CRM (پیامکی)' },
    { id: 'digipay', label: 'اد سرویس دیجی‌پی (DigiPay)' },
    { id: 'google_ads', label: 'گوگل ادز (Google Ads)' },
    { id: 'laghari', label: 'لندینگ لاغری (Laghari)' },
    { id: 'clinic', label: 'لندینگ کلینیک (Clinic)' },
    { id: 'retargeting', label: 'ریتارگتینگ (یکتانت + تپسل)' },
    { id: 'influencer', label: 'اینفلوئنسر مارکتینگ' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/20">
      {/* Top Bar: Brand, Host, Live Sync, Trend Alert, Auth */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Logo & Subdomain branding */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="h-10 px-2.5 py-1.5 rounded-xl bg-white/95 border border-slate-700/60 flex items-center justify-center shadow-lg shadow-black/20 shrink-0">
                <img
                  src="https://tapsi.doctor/images/logo/tapsi-doctor-logo.svg"
                  alt="تپسی دکتر | Tapsi Doctor"
                  className="h-7 w-auto object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                    const fallback = document.getElementById('tpdr-logo-fallback');
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div id="tpdr-logo-fallback" className="hidden items-center justify-center font-bold text-emerald-600 text-sm">
                  تپسی دکتر
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5">
                    داشبورد مارکتینگ تپسی دکتر
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    TPDR Marketing
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-mono text-emerald-400/90 font-medium tracking-wide">
                    tpdr.nexzone.ir
                  </span>
                  <span className="text-slate-600">•</span>
                  <a 
                    href={`https://docs.google.com/spreadsheets/d/${sheetConfig.sheetId}/edit?usp=sharing`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1 underline decoration-slate-700 underline-offset-2"
                  >
                    <span>لینک گوگل شیت</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Mobile Auth Button */}
            <div className="md:hidden">
              {currentUser ? (
                <button
                  onClick={onOpenAdmin}
                  className="p-2 rounded-lg bg-slate-800 text-slate-200 border border-slate-700"
                >
                  <Settings className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onOpenAuthModal}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium"
                >
                  ورود
                </button>
              )}
            </div>
          </div>

          {/* Sync indicator, Trend Alert Pill & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-end flex-wrap">
            
            {/* Trend Alert Badge in Header */}
            {criticalAlertsCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>{toPersianDigits(criticalAlertsCount)} هشدار افت روند</span>
              </div>
            )}

            {/* Live Sheet Status Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSyncing ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isSyncing ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              </span>
              <span className="text-slate-300">
                {isSyncing ? 'در حال دریافت شیت...' : 'متصل به گوگل شیت'}
              </span>
              <span className="text-slate-500 hidden xl:inline">({sheetConfig.lastSyncTime})</span>
              <button
                onClick={onRefreshData}
                disabled={isSyncing}
                title="به‌روزرسانی فوری داده‌ها از گوگل شیت"
                className="mr-1 p-1 rounded-md text-slate-400 hover:text-emerald-400 hover:bg-slate-700/60 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
              </button>
            </div>

            {/* Subdomain & PHP Export guide button */}
            <button
              onClick={onOpenExportGuide}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-medium transition-all"
            >
              <FileCode2 className="w-3.5 h-3.5 text-teal-400" />
              <span>پکیج PHP سابدامین</span>
            </button>

            {/* Admin Panel button */}
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>پنل ادمین و شیت</span>
            </button>

            {/* User Profile / Auth State */}
            {currentUser ? (
              <div className="flex items-center gap-2 pr-2 border-r border-slate-800">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow ring-2 ring-emerald-500/50">
                    {currentUser.name.charAt(0)}
                  </div>
                  {currentUser.has2FA && (
                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-0.5 rounded-full" title="Google Authenticator فعال">
                      <ShieldCheck className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="hidden lg:block text-right">
                  <p className="text-xs font-semibold text-white leading-tight">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-mono">
                    {currentUser.role === 'super_admin' ? 'مدیر ارشد (Super Admin)' : 'مدیر مارکتینگ'}
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  title="خروج از حساب"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-medium shadow-md shadow-emerald-900/40 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ورود با جیمیل و 2FA</span>
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Sub Bar: Date Range filters, "Only Recorded Days" Toggle & Campaign selector */}
      <div className="bg-slate-950/70 border-t border-slate-800/60 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Quick Date Range Pills + Only Recorded Days Filter */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            
            {/* Toggle: Only recorded days in sheet */}
            <button
              onClick={onToggleOnlyRecordedDays}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
                onlyRecordedDays
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="روزهایی که دیتایی در شیت ثبت نشده نباید در دشابورد هم نمایش داده بشه"
            >
              {onlyRecordedDays ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>فقط روزهای ثبت‌شده در شیت ({toPersianDigits(recordedDaysCount)} روز)</span>
            </button>

            <span className="text-slate-600">|</span>

            <span className="text-xs text-slate-400 flex items-center gap-1 ml-1 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>بازه:</span>
            </span>
            {quickRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => onSelectRange(range.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  selectedRange === range.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm font-semibold'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Campaign Filter Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-teal-400" />
              <span>تفکیک کمپین:</span>
            </span>
            <div className="relative min-w-[200px] w-full sm:w-auto">
              <select
                value={selectedCampaign}
                onChange={(e) => onSelectCampaign(e.target.value)}
                className="w-full appearance-none bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 pr-3 pl-8 text-xs text-slate-200 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer shadow-sm"
              >
                {campaignOptions.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-slate-900 text-slate-200 py-1">
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
