/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { TargetProgressCard } from './components/TargetProgressCard';
import { ChartsSection } from './components/ChartsSection';
import { DataTable } from './components/DataTable';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { ExportModal } from './components/ExportModal';

import { DailyMarketingRecord, MonthlyMarketingPlan, SheetConnectionConfig, AppUser } from './types/marketing';
import { INITIAL_DAILY_RECORDS, INITIAL_MONTHLY_PLAN, INITIAL_USERS } from './data/initialData';
import { DEFAULT_SHEET_CONFIG, fetchGoogleSheetData } from './services/sheetsService';
import { analyzeTrendAlerts } from './utils/trendDetector';
import { CheckCircle2, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

export default function App() {
  // Application Data States
  const [records, setRecords] = useState<DailyMarketingRecord[]>(() => {
    const saved = localStorage.getItem('tpdr_marketing_records');
    return saved ? JSON.parse(saved) : INITIAL_DAILY_RECORDS;
  });

  const [monthlyPlan] = useState<MonthlyMarketingPlan>(INITIAL_MONTHLY_PLAN);
  
  const [sheetConfig, setSheetConfig] = useState<SheetConnectionConfig>(() => {
    const saved = localStorage.getItem('tpdr_sheet_config');
    return saved ? JSON.parse(saved) : DEFAULT_SHEET_CONFIG;
  });

  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('tpdr_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Current logged in user (default logged in as the requester ghahreman.tapsidoctor@gmail.com for instant usability)
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('tpdr_current_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0];
  });

  // Filtering states
  const [selectedRange, setSelectedRange] = useState<string>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  // "روزهایی که دیتایی در شیت ثبت نشده نباید در دشابورد هم نمایش داده بشه" - default to true!
  const [onlyRecordedDays, setOnlyRecordedDays] = useState<boolean>(true);

  // Modal states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Sync with Google Sheet handler
  const handleSyncData = useCallback(async (manual = false) => {
    setIsSyncing(true);
    try {
      const result = await fetchGoogleSheetData(sheetConfig);
      if (result.success && result.data && result.data.length > 0) {
        setRecords(result.data);
        localStorage.setItem('tpdr_marketing_records', JSON.stringify(result.data));
        
        const nowStr = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
        const updatedConfig = {
          ...sheetConfig,
          lastSyncTime: `امروز ساعت ${nowStr}`,
          syncStatus: 'success' as const,
        };
        setSheetConfig(updatedConfig);
        localStorage.setItem('tpdr_sheet_config', JSON.stringify(updatedConfig));

        if (manual) {
          showToast('اطلاعات با موفقیت از گوگل شیت همگام‌سازی شد.', 'success');
        }
      } else {
        if (manual) {
          showToast(result.error || 'داده‌های شیت در دسترس نیست، داده‌های محلی نمایش داده می‌شوند.', 'info');
        }
      }
    } catch (err) {
      console.error(err);
      if (manual) {
        showToast('خطا در برقراری ارتباط با گوگل شیت', 'error');
      }
    } finally {
      setIsSyncing(false);
    }
  }, [sheetConfig, showToast]);

  // Periodic Auto-Sync Timer
  useEffect(() => {
    if (!sheetConfig.autoSync || sheetConfig.syncIntervalSeconds <= 0) return;
    const interval = setInterval(() => {
      handleSyncData(false);
    }, sheetConfig.syncIntervalSeconds * 1000);
    return () => clearInterval(interval);
  }, [sheetConfig.autoSync, sheetConfig.syncIntervalSeconds, handleSyncData]);

  // Save changes to localStorage
  const handleUpdateRecord = (updated: DailyMarketingRecord) => {
    const updatedWithFlag: DailyMarketingRecord = {
      ...updated,
      hasRecordedData: true,
    };
    const newRecords = records.map((r) => (r.id === updated.id ? updatedWithFlag : r));
    setRecords(newRecords);
    localStorage.setItem('tpdr_marketing_records', JSON.stringify(newRecords));
    showToast(`داده‌های روز ${updated.dayNumber} با موفقیت ویرایش و محاسبه شدند.`, 'success');
  };

  const handleUpdateSheetConfig = (newConfig: SheetConnectionConfig) => {
    setSheetConfig(newConfig);
    localStorage.setItem('tpdr_sheet_config', JSON.stringify(newConfig));
    showToast('تنظیمات گوگل شیت ذخیره شد.', 'success');
  };

  const handleUpdateUsers = (newUsers: AppUser[]) => {
    setUsers(newUsers);
    localStorage.setItem('tpdr_users', JSON.stringify(newUsers));
    showToast('دسترسی‌های کاربران به‌روزرسانی شد.', 'success');
  };

  const handleLoginSuccess = (user: AppUser) => {
    setCurrentUser(user);
    localStorage.setItem('tpdr_current_user', JSON.stringify(user));
    showToast(`خوش‌آمدید ${user.name}! احراز هویت دومرحله‌ای تأیید شد.`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('tpdr_current_user');
    showToast('از حساب کاربری خارج شدید.', 'info');
  };

  // 1. Records with actual performance data recorded in sheet
  const recordedRecords = useMemo(() => {
    return records.filter((r) => r.hasRecordedData !== false && (r.totalOrder > 0 || r.totalGmv > 0 || r.leads > 0));
  }, [records]);

  // 2. Filter records based on "onlyRecordedDays" and selectedRange
  const activeRecords = useMemo(() => {
    let base = onlyRecordedDays ? recordedRecords : records;
    if (selectedRange === 'w1') {
      base = base.filter((r) => r.dayNumber === 1);
    } else if (selectedRange === 'w2') {
      base = base.filter((r) => r.dayNumber >= 2 && r.dayNumber <= 8);
    } else if (selectedRange === 'w3') {
      base = base.filter((r) => r.dayNumber >= 9 && r.dayNumber <= 15);
    } else if (selectedRange === 'w4') {
      base = base.filter((r) => r.dayNumber >= 16 && r.dayNumber <= 22);
    } else if (selectedRange === 'w5') {
      base = base.filter((r) => r.dayNumber >= 23 && r.dayNumber <= 30);
    } else if (selectedRange === 'last3') {
      base = base.slice(-3);
    } else if (selectedRange === 'last7') {
      base = base.slice(-7);
    }
    return base;
  }, [records, recordedRecords, onlyRecordedDays, selectedRange]);

  // 3. Analyze Trend Alerts on the active records
  const trendAlerts = useMemo(() => {
    return analyzeTrendAlerts(activeRecords, monthlyPlan.targetCac);
  }, [activeRecords, monthlyPlan.targetCac]);

  const criticalAlertsCount = useMemo(() => {
    return trendAlerts.filter((a) => a.severity === 'critical').length;
  }, [trendAlerts]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Vazirmatn',sans-serif]">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 left-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-xs text-white animate-bounce">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
          {toast.type === 'info' && <Sparkles className="w-4 h-4 text-teal-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Responsive Header */}
      <Header
        currentUser={currentUser}
        sheetConfig={sheetConfig}
        onRefreshData={() => handleSyncData(true)}
        isSyncing={isSyncing}
        selectedRange={selectedRange}
        onSelectRange={setSelectedRange}
        selectedCampaign={selectedCampaign}
        onSelectCampaign={setSelectedCampaign}
        recordedDaysCount={recordedRecords.length}
        criticalAlertsCount={criticalAlertsCount}
        onlyRecordedDays={onlyRecordedDays}
        onToggleOnlyRecordedDays={() => setOnlyRecordedDays(!onlyRecordedDays)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenExportGuide={() => setIsExportOpen(true)}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* KPI Metric Summary Cards with Trend Alert Banner */}
        <KpiCards
          records={activeRecords}
          monthlyPlan={monthlyPlan}
          campaignFilter={selectedCampaign}
          alerts={trendAlerts}
        />

        {/* Target Plan vs Actuals Progress Card */}
        <TargetProgressCard
          monthlyPlan={monthlyPlan}
          records={recordedRecords}
        />

        {/* Visual Charts & Funnel Section */}
        <ChartsSection
          records={activeRecords}
          monthlyPlan={monthlyPlan}
        />

        {/* Detailed Daily Marketing Table */}
        <DataTable
          records={activeRecords}
          sheetConfig={sheetConfig}
          onUpdateRecord={handleUpdateRecord}
        />

      </main>

      {/* Footer */}
      <footer className="bg-slate-900/60 border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            سیستم هوشمند تحلیل و داشبورد مارکتینگ تپسی دکتر • متصل به شیت رسمی آبان ۱۴۰۵ • مجهز به Trend Alert هوشمند
          </p>
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span>دامنه: <strong className="text-emerald-400">tpdr.nexzone.ir</strong></span>
            <span>•</span>
            <span>Google OAuth 2.0 & Authenticator</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccessLogin={handleLoginSuccess}
        existingUsers={users}
      />

      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        users={users}
        onUpdateUsers={handleUpdateUsers}
        sheetConfig={sheetConfig}
        onUpdateSheetConfig={handleUpdateSheetConfig}
        records={records}
        onUpdateRecords={(recs) => {
          setRecords(recs);
          localStorage.setItem('tpdr_marketing_records', JSON.stringify(recs));
          showToast('دیتای شیت با موفقیت به‌روزرسانی شد.', 'success');
        }}
        onOpenExportModal={() => {
          setIsAdminOpen(false);
          setIsExportOpen(true);
        }}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        sheetId={sheetConfig.sheetId}
      />

    </div>
  );
}
