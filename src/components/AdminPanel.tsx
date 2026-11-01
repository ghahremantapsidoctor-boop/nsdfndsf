import React, { useState } from 'react';
import { 
  Users, 
  Settings, 
  Database, 
  FileCode, 
  Plus, 
  Trash2, 
  Shield, 
  Key, 
  Check, 
  X, 
  RefreshCw, 
  ExternalLink,
  Save,
  Globe,
  Lock,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { AppUser, SheetConnectionConfig, UserRole, DailyMarketingRecord } from '../types/marketing';
import { fetchGoogleSheetData } from '../services/sheetsService';
import { toPersianDigits } from '../utils/formatters';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  users: AppUser[];
  onUpdateUsers: (users: AppUser[]) => void;
  sheetConfig: SheetConnectionConfig;
  onUpdateSheetConfig: (config: SheetConnectionConfig) => void;
  records: DailyMarketingRecord[];
  onUpdateRecords: (records: DailyMarketingRecord[]) => void;
  onOpenExportModal: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  users,
  onUpdateUsers,
  sheetConfig,
  onUpdateSheetConfig,
  records,
  onUpdateRecords,
  onOpenExportModal,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'sheet' | 'data' | 'subdomain'>('users');
  
  // Sheet config state
  const [tempSheetConfig, setTempSheetConfig] = useState<SheetConnectionConfig>({ ...sheetConfig });
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'testing' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });

  // User form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('marketing_lead');

  if (!isOpen) return null;

  // User management actions
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserEmail.includes('@')) return;

    const newUser: AppUser = {
      id: `usr_${Date.now()}`,
      name: newUserName || newUserEmail.split('@')[0],
      email: newUserEmail,
      role: newUserRole,
      has2FA: true,
      twoFactorSecret: 'JBSWY3DPEHPK3PXP',
      status: 'active',
      lastLogin: 'تازه اضافه شده',
    };

    onUpdateUsers([...users, newUser]);
    setNewUserName('');
    setNewUserEmail('');
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    onUpdateUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
  };

  const handleToggle2FA = (userId: string) => {
    onUpdateUsers(users.map((u) => (u.id === userId ? { ...u, has2FA: !u.has2FA } : u)));
  };

  const handleDeleteUser = (userId: string) => {
    if (users.length <= 1) return;
    onUpdateUsers(users.filter((u) => u.id !== userId));
  };

  // Test live connection to Google Sheet
  const handleTestConnection = async () => {
    setTestResult({ status: 'testing', message: 'در حال بررسی اتصال به گوگل شیت...' });
    const res = await fetchGoogleSheetData(tempSheetConfig);
    if (res.success) {
      setTestResult({
        status: 'success',
        message: `اتصال موفقیت‌آمیز بود! ${toPersianDigits(res.data?.length || 0)} ردیف داده دریافت شد.`,
      });
      onUpdateSheetConfig({ ...tempSheetConfig, syncStatus: 'success', lastSyncTime: 'همین الان' });
    } else {
      setTestResult({
        status: 'error',
        message: `خطا در اتصال: ${res.error || 'دسترسی محدود است یا شیت یافت نشد'}`,
      });
    }
  };

  const handleSaveSheetConfig = () => {
    onUpdateSheetConfig(tempSheetConfig);
    setTestResult({ status: 'success', message: 'تنظیمات شیت با موفقیت ذخیره شد.' });
  };

  // Add new day record
  const handleAddNewDay = () => {
    const nextDay = records.length + 1;
    const newRecord: DailyMarketingRecord = {
      id: nextDay,
      dayNumber: nextDay,
      dayName: 'روز کاری',
      dateStr: `${nextDay} آبان ۱۴۰۵`,
      targetOrder: 1600,
      targetGmv: 4800000000,
      gmvAchievedPercent: 92.5,
      leads: 18000,
      logins: 5000,
      orderOcs: 150,
      orderOms: 950,
      orderCampaignLaghari: 0,
      orderCampaignClinic: 0,
      totalOrder: 1100,
      gmvOcs: 70000000,
      gmvOms: 4500000000,
      gmvCampaignLaghari: 0,
      gmvCampaignClinic: 0,
      totalGmv: 4570000000,
      voucherOcs: 20000000,
      voucherOms: 35000000,
      voucherCampaign: 0,
      totalVoucher: 55000000,
      retentionSmsJourney: 1200000,
      retentionCpcYektanet: 1600000,
      retentionCpcTapsell: 0,
      retentionCampaignTag: 0,
      totalRetention: 2800000,
      acqCampaignTag: 0,
      acqAdServiceTpdr: 80000000,
      acqExtraTag: 0,
      acqSmsJourneyNewSegment: 400000000,
      acqMopon: 0,
      acqSmsSua: 0,
      acqSuaBanner: 0,
      acqBnplDigipay: 173333333,
      acqGoogleAdsLira: 4100,
      acqGoogleAdsTomans: 23500000,
      acqInfluencer: 0,
      totalAcquisitionCost: 676833333,
      totalAcqAndRetentionCost: 679633333,
      totalMarketingCostPlusVoucher: 734633333,
      cpl: 37757,
      cpa: 135926,
      cpoMediaOnly: 617848,
      cpoMediaPlusVoucher: 667848,
      newUserOcs: 90,
      newUserOms: 330,
      newUserCampaign: 0,
      newUserOverall: 420,
      cacAcquisitionOnly: 1611507,
      cacAcquisitionPlusVoucher: 1742460,
      cacCampaignOnly: 0,
      cr1: 6.11,
      cr2: 22.0,
    };

    onUpdateRecords([...records, newRecord]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl p-6 shadow-2xl relative overflow-hidden text-right max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                پنل مدیریت و تنظیمات سیستم (Admin Control Center)
              </h3>
              <p className="text-xs text-slate-400">
                مدیریت دسترسی کاربران، اتصال زنده به شیت، و پکیج سابدامین tpdr.nexzone.ir
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 py-4 border-b border-slate-800 shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'users'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>مدیریت کاربران و دسترسی‌ها ({toPersianDigits(users.length)})</span>
          </button>

          <button
            onClick={() => setActiveTab('sheet')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'sheet'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>تنظیمات اتصال به گوگل شیت</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'data'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>مدیریت دیتای شیت ({toPersianDigits(records.length)} روز)</span>
          </button>

          <button
            onClick={() => setActiveTab('subdomain')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'subdomain'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>سابدامین tpdr.nexzone.ir و بک‌اند PHP</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="py-4 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: USERS & ROLES */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              
              {/* Add User Form */}
              <form onSubmit={handleAddUser} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>افزودن کاربر جدید یا تعیین سطح دسترسی:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">نام یا عنوان:</label>
                    <input
                      type="text"
                      placeholder="علی رضایی"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">جیمیل یا ایمیل:</label>
                    <input
                      type="email"
                      placeholder="user@tapsidoctor.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">نقش و سطح دسترسی:</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="super_admin">مدیر ارشد (Super Admin) - دسترسی کامل</option>
                      <option value="marketing_lead">مدیر مارکتینگ (Marketing Lead) - ویرایش شیت</option>
                      <option value="campaign_specialist">کارشناس کمپین (Specialist) - مشاهده و ویرایش</option>
                      <option value="viewer">فقط مشاهده (Viewer)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-900/30"
                  >
                    <Plus className="w-4 h-4" />
                    <span>افزودن به لیست کاربران مجاز</span>
                  </button>
                </div>
              </form>

              {/* Users List Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">کاربر</th>
                      <th className="py-2.5 px-3">ایمیل / جیمیل</th>
                      <th className="py-2.5 px-3">نقش</th>
                      <th className="py-2.5 px-3">احراز ۲ مرحله‌ای (2FA)</th>
                      <th className="py-2.5 px-3">آخرین ورود</th>
                      <th className="py-2.5 px-3 text-center">حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-sans">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-semibold text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-xs">
                            {u.name.charAt(0)}
                          </div>
                          <span>{u.name}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300" dir="ltr">{u.email}</td>
                        <td className="py-2.5 px-3">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                            className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                          >
                            <option value="super_admin">Super Admin</option>
                            <option value="marketing_lead">Marketing Lead</option>
                            <option value="campaign_specialist">Campaign Specialist</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => handleToggle2FA(u.id)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-mono font-medium transition-colors ${
                              u.has2FA
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {u.has2FA ? 'فعال (Authenticator)' : 'غیرفعال'}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{u.lastLogin || '-'}</td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={users.length <= 1}
                            className="p-1 rounded text-slate-500 hover:text-red-400 disabled:opacity-30"
                            title="حذف دسترسی کاربر"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 2: SHEET CONNECTION CONFIG */}
          {activeTab === 'sheet' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h4 className="text-sm font-bold text-white">اتصال به گوگل شیت اختصاصی</h4>
                    <p className="text-xs text-slate-400">آدرس و مشخصات شیت گزارش روزانه تپسی دکتر</p>
                  </div>
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${tempSheetConfig.sheetId}/edit?usp=sharing`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"
                  >
                    <span>مشاهده شیت در تب جدید</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      شناسه گوگل شیت (Spreadsheet ID):
                    </label>
                    <input
                      type="text"
                      value={tempSheetConfig.sheetId}
                      onChange={(e) => setTempSheetConfig({ ...tempSheetConfig, sheetId: e.target.value.trim() })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                      dir="ltr"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      پیش‌فرض: <span className="font-mono text-emerald-400">1xsAaDKslYxZA7rSxyVxXpyQ0V68qI1Ig6roQy3okEGY</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        شناسه تب یا برگه (GID):
                      </label>
                      <input
                        type="text"
                        value={tempSheetConfig.gid}
                        onChange={(e) => setTempSheetConfig({ ...tempSheetConfig, gid: e.target.value.trim() })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        عنوان برگه (Tab Name):
                      </label>
                      <input
                        type="text"
                        value={tempSheetConfig.tabName}
                        onChange={(e) => setTempSheetConfig({ ...tempSheetConfig, tabName: e.target.value.trim() })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempSheetConfig.autoSync}
                        onChange={(e) => setTempSheetConfig({ ...tempSheetConfig, autoSync: e.target.checked })}
                        className="rounded border-slate-700 bg-slate-900 text-emerald-500"
                      />
                      <span className="text-slate-200">به‌روزرسانی خودکار و دوره‌ای (Auto-Sync)</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">فاصله زمانی:</span>
                      <select
                        value={tempSheetConfig.syncIntervalSeconds}
                        onChange={(e) => setTempSheetConfig({ ...tempSheetConfig, syncIntervalSeconds: Number(e.target.value) })}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                      >
                        <option value={30}>هر ۳۰ ثانیه</option>
                        <option value={60}>هر ۱ دقیقه</option>
                        <option value={300}>هر ۵ دقیقه</option>
                        <option value={600}>هر ۱۰ دقیقه</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Connection Status / Output */}
                {testResult.message && (
                  <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    testResult.status === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : testResult.status === 'error'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                  }`}>
                    {testResult.status === 'testing' && <RefreshCw className="w-4 h-4 animate-spin shrink-0" />}
                    {testResult.status === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />}
                    {testResult.status === 'error' && <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />}
                    <span>{testResult.message}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <button
                    onClick={handleTestConnection}
                    disabled={testResult.status === 'testing'}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testResult.status === 'testing' ? 'animate-spin' : ''}`} />
                    <span>تست زنده اتصال به شیت</span>
                  </button>

                  <button
                    onClick={handleSaveSheetConfig}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/30"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>ذخیره تنظیمات</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: DATA MANAGEMENT & OVERRIDES */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">مدیریت دیتای شیت در حافظه</h4>
                    <p className="text-xs text-slate-400">
                      تعداد کل روزهای ثبت‌شده در داشبورد: {toPersianDigits(records.length)} روز
                    </p>
                  </div>
                  <button
                    onClick={handleAddNewDay}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/30 self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>ثبت رکورد روز جدید ({toPersianDigits(records.length + 1)} آبان)</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2">
                  <p className="font-semibold text-emerald-400">
                    نکته درباره همگام‌سازی دوطرفه:
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    با وارد کردن اطلاعات در گوگل شیت و کلیک روی دکمه همگام‌سازی، داده‌ها به صورت خودکار در این داشبورد بازخوانی می‌شوند. همچنین اگر رکوردی را درون این داشبورد ویرایش کنید، محاسبات GMV، CAC، CPO و قیف بلادرنگ به‌روزرسانی می‌شوند و می‌توانید خروجی CSV را برای جایگزینی در گوگل شیت دانلود کنید.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SUBDOMAIN & PHP BACKEND */}
          {activeTab === 'subdomain' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <span>پیکربندی اختصاصی برای سابدامین tpdr.nexzone.ir</span>
                    </h4>
                    <p className="text-xs text-slate-400">راهنمای استقرار سریع با PHP و وب‌سرور آپاچی یا انجین‌ایکس</p>
                  </div>
                  <button
                    onClick={onOpenExportModal}
                    className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-900/30"
                  >
                    <Download className="w-4 h-4" />
                    <span>مشاهده و دانلود کدهای PHP سابدامین</span>
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="font-bold text-slate-200 block mb-1">دامنه اختصاصی هدف:</span>
                    <span className="font-mono text-emerald-400 text-sm">https://tpdr.nexzone.ir</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <span className="font-bold text-slate-200 block">ساختار فایل‌های استقرار در cPanel / هاست:</span>
                    <ul className="list-disc list-inside text-slate-400 space-y-1 font-mono text-[11px]" dir="ltr">
                      <li>/public_html (or subdomain directory for tpdr.nexzone.ir)</li>
                      <li>├── index.html (داشبورد کامپایل‌شده فرانت‌اند)</li>
                      <li>├── .htaccess (تنظیمات ریدایرکت، SSL و CORS)</li>
                      <li>├── config.php (اطلاعات سابدامین و کلید شیت)</li>
                      <li>└── api/proxy.php (پروکسی امن PHP برای خواندن گوگل شیت و احراز هویت بدون مشکل CORS)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
