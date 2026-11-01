import React, { useState } from 'react';
import { 
  Table as TableIcon, 
  Search, 
  Download, 
  ExternalLink, 
  Edit3, 
  Check, 
  X, 
  ArrowUpDown,
  Filter,
  Layers,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { DailyMarketingRecord, SheetConnectionConfig } from '../types/marketing';
import { formatCompactToman, formatCurrencyIRT, formatPercent, toPersianDigits } from '../utils/formatters';
import { exportRecordsToCSV } from '../services/sheetsService';

interface DataTableProps {
  records: DailyMarketingRecord[];
  sheetConfig: SheetConnectionConfig;
  onUpdateRecord: (updated: DailyMarketingRecord) => void;
}

type ViewColumnMode = 'executive' | 'sales' | 'voucher_retention' | 'media_acquisition' | 'unit_economics';

export const DataTable: React.FC<DataTableProps> = ({ records, sheetConfig, onUpdateRecord }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewColumnMode>('executive');
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<DailyMarketingRecord | null>(null);
  const [sortField, setSortField] = useState<keyof DailyMarketingRecord>('dayNumber');
  const [sortAsc, setSortAsc] = useState(true);

  // Filter records by search
  const filteredRecords = records.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.dayNumber.toString().includes(q) ||
      r.dateStr.includes(q) ||
      r.dayName.includes(q)
    );
  });

  // Sort records
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
  });

  const handleSort = (field: keyof DailyMarketingRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleStartEdit = (rec: DailyMarketingRecord) => {
    setEditingRowId(rec.id);
    setEditFormData({ ...rec });
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditFormData(null);
  };

  const handleSaveEdit = () => {
    if (editFormData) {
      // Recalculate totals
      const totalOrder = editFormData.orderOcs + editFormData.orderOms + editFormData.orderCampaignLaghari + editFormData.orderCampaignClinic;
      const totalGmv = editFormData.gmvOcs + editFormData.gmvOms + editFormData.gmvCampaignLaghari + editFormData.gmvCampaignClinic;
      const totalVoucher = editFormData.voucherOcs + editFormData.voucherOms + editFormData.voucherCampaign;
      const totalRetention = editFormData.retentionSmsJourney + editFormData.retentionCpcYektanet + editFormData.retentionCpcTapsell + editFormData.retentionCampaignTag;
      const totalAcquisition = editFormData.acqCampaignTag + editFormData.acqAdServiceTpdr + editFormData.acqSmsJourneyNewSegment + editFormData.acqBnplDigipay + editFormData.acqGoogleAdsTomans + editFormData.acqInfluencer;
      const totalSpend = totalAcquisition + totalRetention + totalVoucher;
      const newUserOverall = editFormData.newUserOcs + editFormData.newUserOms + editFormData.newUserCampaign;
      const gmvP = editFormData.targetGmv > 0 ? Number(((totalGmv / editFormData.targetGmv) * 100).toFixed(2)) : 0;
      const cr1 = editFormData.leads > 0 ? Number(((totalOrder / editFormData.leads) * 100).toFixed(2)) : 0;
      const cr2 = editFormData.logins > 0 ? Number(((totalOrder / editFormData.logins) * 100).toFixed(2)) : 0;
      const cac = newUserOverall > 0 ? Math.round(totalAcquisition / newUserOverall) : 0;
      const cpo = totalOrder > 0 ? Math.round((totalAcquisition + totalRetention) / totalOrder) : 0;

      const finalized: DailyMarketingRecord = {
        ...editFormData,
        totalOrder,
        totalGmv,
        totalVoucher,
        totalRetention,
        totalAcquisitionCost: totalAcquisition,
        totalAcqAndRetentionCost: totalAcquisition + totalRetention,
        totalMarketingCostPlusVoucher: totalSpend,
        newUserOverall,
        gmvAchievedPercent: gmvP,
        cr1,
        cr2,
        cacAcquisitionOnly: cac,
        cpoMediaOnly: cpo,
      };

      onUpdateRecord(finalized);
    }
    setEditingRowId(null);
    setEditFormData(null);
  };

  const handleDownloadCsv = () => {
    const csvContent = exportRecordsToCSV(records);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TPDR_Marketing_Aban_1405_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
      
      {/* Table Header: Title, View Switcher, Search, CSV Export */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-emerald-400" />
            <span>جدول تفصیلی گزارش روزانه بازاریابی تپسی دکتر</span>
          </h3>
          <p className="text-xs text-slate-400">
            برگرفته مستقیم از ستون‌های شیت رسمی (Target, Funnel, Sales, Voucher, Retention, Media Cost, CAC)
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 lg:pb-0">
          <button
            onClick={() => setViewMode('executive')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
              viewMode === 'executive'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750'
            }`}
          >
            خلاصه اجرایی
          </button>
          <button
            onClick={() => setViewMode('sales')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
              viewMode === 'sales'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750'
            }`}
          >
            سفارش و GMV
          </button>
          <button
            onClick={() => setViewMode('voucher_retention')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
              viewMode === 'voucher_retention'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750'
            }`}
          >
            ووچر و ریتنشن
          </button>
          <button
            onClick={() => setViewMode('media_acquisition')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
              viewMode === 'media_acquisition'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750'
            }`}
          >
            مدیا و تبلیغات جذب
          </button>
          <button
            onClick={() => setViewMode('unit_economics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
              viewMode === 'unit_economics'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750'
            }`}
          >
            شاخص‌های CAC و تبدیل
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <input
              type="text"
              placeholder="جستجوی روز یا تاریخ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 pr-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={handleDownloadCsv}
            title="دانلود فایل اکسل / CSV"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          <a
            href={`https://docs.google.com/spreadsheets/d/${sheetConfig.sheetId}/edit?usp=sharing`}
            target="_blank"
            rel="noopener noreferrer"
            title="مشاهده شیت در گوگل درایو"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold select-none">
            <tr>
              <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('dayNumber')}>
                <div className="flex items-center gap-1">
                  <span>روز</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3">تاریخ</th>
              
              {/* Conditional Columns based on viewMode */}
              {viewMode === 'executive' && (
                <>
                  <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('targetGmv')}>
                    تارگت GMV
                  </th>
                  <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('totalGmv')}>
                    فروش کل (GMV)
                  </th>
                  <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('gmvAchievedPercent')}>
                    درصد تحقق
                  </th>
                  <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('totalOrder')}>
                    سفارش کل
                  </th>
                  <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('totalMarketingCostPlusVoucher')}>
                    کل بودجه مصرفی
                  </th>
                  <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('newUserOverall')}>
                    کاربر جدید
                  </th>
                  <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('cacAcquisitionOnly')}>
                    CAC
                  </th>
                  <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('cr2')}>
                    CR2 %
                  </th>
                </>
              )}

              {viewMode === 'sales' && (
                <>
                  <th className="py-3 px-3">سفارش OCS</th>
                  <th className="py-3 px-3">سفارش OMS</th>
                  <th className="py-3 px-3">کمپین لاغری</th>
                  <th className="py-3 px-3">کمپین کلینیک</th>
                  <th className="py-3 px-3 font-bold text-blue-400">مجموع سفارش</th>
                  <th className="py-3 px-3">GMV تعرفه (OCS)</th>
                  <th className="py-3 px-3">GMV تأمین‌کننده (OMS)</th>
                  <th className="py-3 px-3 font-bold text-emerald-400">مجموع GMV</th>
                </>
              )}

              {viewMode === 'voucher_retention' && (
                <>
                  <th className="py-3 px-3">ووچر OCS</th>
                  <th className="py-3 px-3">ووچر OMS</th>
                  <th className="py-3 px-3 font-bold text-amber-400">کل هزینه ووچر</th>
                  <th className="py-3 px-3">اس‌ام‌اس ریتنشن</th>
                  <th className="py-3 px-3">یکتانت ریتارگت</th>
                  <th className="py-3 px-3">تپسل ریتارگت</th>
                  <th className="py-3 px-3 font-bold text-teal-400">کل ریتنشن</th>
                </>
              )}

              {viewMode === 'media_acquisition' && (
                <>
                  <th className="py-3 px-3">اد سرویس دیجی‌پی</th>
                  <th className="py-3 px-3">اس‌ام‌اس سگمنت جدید</th>
                  <th className="py-3 px-3">گوگل ادز (تومان)</th>
                  <th className="py-3 px-3">سرویس تپسی دکتر</th>
                  <th className="py-3 px-3">اینفلوئنسر</th>
                  <th className="py-3 px-3 font-bold text-purple-400">کل جذب (Acquisition)</th>
                  <th className="py-3 px-3 font-bold text-emerald-400">کل مارکتینگ + ووچر</th>
                </>
              )}

              {viewMode === 'unit_economics' && (
                <>
                  <th className="py-3 px-3">هزینه لید (CPL)</th>
                  <th className="py-3 px-3">هزینه لاگین (CPA)</th>
                  <th className="py-3 px-3">CPO فقط مدیا</th>
                  <th className="py-3 px-3">CPO با ووچر</th>
                  <th className="py-3 px-3 font-bold text-emerald-400">CAC کاربر جدید</th>
                  <th className="py-3 px-3">CR1 (لید به سفارش)</th>
                  <th className="py-3 px-3">CR2 (لاگین به سفارش)</th>
                </>
              )}

              <th className="py-3 px-3 text-center">عملیات</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60 font-sans">
            {sortedRecords.map((row) => {
              const isEditing = editingRowId === row.id;

              return (
                <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                    {toPersianDigits(row.dayNumber)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-medium">
                    {row.dayName} ({row.dateStr.split(' ')[0]})
                  </td>

                  {/* Mode: Executive Summary */}
                  {viewMode === 'executive' && (
                    <>
                      <td className="py-2.5 px-3 text-slate-400 font-mono">
                        {formatCompactToman(row.targetGmv)}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white font-mono">
                        {formatCompactToman(row.totalGmv)}
                      </td>
                      <td className="py-2.5 px-3 font-bold font-mono">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${row.gmvAchievedPercent >= 100 ? 'bg-emerald-500/10 text-emerald-400' : row.gmvAchievedPercent >= 80 ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {formatPercent(row.gmvAchievedPercent)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-blue-300 font-semibold">
                        {formatCurrencyIRT(row.totalOrder)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 font-mono">
                        {formatCompactToman(row.totalMarketingCostPlusVoucher)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">
                        {formatCurrencyIRT(row.newUserOverall)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-purple-300 font-semibold">
                        {formatCompactToman(row.cacAcquisitionOnly)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400 font-semibold">
                        {toPersianDigits(row.cr2.toFixed(1))}٪
                      </td>
                    </>
                  )}

                  {/* Mode: Sales & GMV */}
                  {viewMode === 'sales' && (
                    <>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{formatCurrencyIRT(row.orderOcs)}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{formatCurrencyIRT(row.orderOms)}</td>
                      <td className="py-2.5 px-3 font-mono text-purple-300">{formatCurrencyIRT(row.orderCampaignLaghari)}</td>
                      <td className="py-2.5 px-3 font-mono text-pink-300">{formatCurrencyIRT(row.orderCampaignClinic)}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-400">{formatCurrencyIRT(row.totalOrder)}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{formatCompactToman(row.gmvOcs)}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{formatCompactToman(row.gmvOms)}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{formatCompactToman(row.totalGmv)}</td>
                    </>
                  )}

                  {/* Mode: Voucher & Retention */}
                  {viewMode === 'voucher_retention' && (
                    <>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{formatCompactToman(row.voucherOcs)}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{formatCompactToman(row.voucherOms)}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{formatCompactToman(row.totalVoucher)}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{formatCompactToman(row.retentionSmsJourney)}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{formatCompactToman(row.retentionCpcYektanet)}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{toPersianDigits(row.retentionCpcTapsell)}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-teal-400">{formatCompactToman(row.totalRetention)}</td>
                    </>
                  )}

                  {/* Mode: Media & Acquisition */}
                  {viewMode === 'media_acquisition' && (
                    <>
                      <td className="py-2.5 px-3 font-mono text-blue-300">{formatCompactToman(row.acqBnplDigipay)}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-300">{formatCompactToman(row.acqSmsJourneyNewSegment)}</td>
                      <td className="py-2.5 px-3 font-mono text-purple-300">{formatCompactToman(row.acqGoogleAdsTomans)}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{formatCompactToman(row.acqAdServiceTpdr)}</td>
                      <td className="py-2.5 px-3 font-mono text-pink-300">{formatCompactToman(row.acqInfluencer)}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-purple-400">{formatCompactToman(row.totalAcquisitionCost)}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{formatCompactToman(row.totalMarketingCostPlusVoucher)}</td>
                    </>
                  )}

                  {/* Mode: Unit Economics */}
                  {viewMode === 'unit_economics' && (
                    <>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{formatCurrencyIRT(row.cpl)}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{formatCurrencyIRT(row.cpa)}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{formatCompactToman(row.cpoMediaOnly)}</td>
                      <td className="py-2.5 px-3 font-mono text-amber-300">{formatCompactToman(row.cpoMediaPlusVoucher)}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{formatCompactToman(row.cacAcquisitionOnly)}</td>
                      <td className="py-2.5 px-3 font-mono text-blue-400">{toPersianDigits(row.cr1.toFixed(2))}٪</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400">{toPersianDigits(row.cr2.toFixed(2))}٪</td>
                    </>
                  )}

                  {/* Actions Column */}
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => handleStartEdit(row)}
                      className="p-1 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                      title="ویرایش سریع مقادیر این روز"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Inline Row Editor Modal */}
      {editingRowId !== null && editFormData && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                <span>ویرایش سریع داده‌های روز {toPersianDigits(editFormData.dayNumber)} ({editFormData.dateStr})</span>
              </h4>
              <button onClick={handleCancelEdit} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">تارگت سفارش:</label>
                <input
                  type="number"
                  value={editFormData.targetOrder}
                  onChange={(e) => setEditFormData({ ...editFormData, targetOrder: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">تارگت GMV:</label>
                <input
                  type="number"
                  value={editFormData.targetGmv}
                  onChange={(e) => setEditFormData({ ...editFormData, targetGmv: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">سفارش OCS:</label>
                <input
                  type="number"
                  value={editFormData.orderOcs}
                  onChange={(e) => setEditFormData({ ...editFormData, orderOcs: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">سفارش OMS:</label>
                <input
                  type="number"
                  value={editFormData.orderOms}
                  onChange={(e) => setEditFormData({ ...editFormData, orderOms: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">GMV تعرفه (OCS):</label>
                <input
                  type="number"
                  value={editFormData.gmvOcs}
                  onChange={(e) => setEditFormData({ ...editFormData, gmvOcs: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">GMV تأمین‌کننده (OMS):</label>
                <input
                  type="number"
                  value={editFormData.gmvOms}
                  onChange={(e) => setEditFormData({ ...editFormData, gmvOms: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">لید ورودی (DAU):</label>
                <input
                  type="number"
                  value={editFormData.leads}
                  onChange={(e) => setEditFormData({ ...editFormData, leads: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">ورود اولی (Logins):</label>
                <input
                  type="number"
                  value={editFormData.logins}
                  onChange={(e) => setEditFormData({ ...editFormData, logins: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">اس‌ام‌اس جذب جدید (IRT):</label>
                <input
                  type="number"
                  value={editFormData.acqSmsJourneyNewSegment}
                  onChange={(e) => setEditFormData({ ...editFormData, acqSmsJourneyNewSegment: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">گوگل ادز (تومان):</label>
                <input
                  type="number"
                  value={editFormData.acqGoogleAdsTomans}
                  onChange={(e) => setEditFormData({ ...editFormData, acqGoogleAdsTomans: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-750 text-xs font-medium"
              >
                انصراف
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/40"
              >
                ذخیره و محاسبه خودکار
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
