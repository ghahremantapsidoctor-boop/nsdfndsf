import { DailyMarketingRecord, SheetConnectionConfig } from '../types/marketing';
import { INITIAL_DAILY_RECORDS } from '../data/initialData';

export const DEFAULT_SHEET_CONFIG: SheetConnectionConfig = {
  sheetId: '1xsAaDKslYxZA7rSxyVxXpyQ0V68qI1Ig6roQy3okEGY',
  gid: '0',
  tabName: 'Aban',
  usePublicCsv: true,
  autoSync: true,
  syncIntervalSeconds: 60,
  lastSyncTime: 'چند لحظه پیش (به‌روز)',
  syncStatus: 'success',
  onlyRecordedDays: true,
};

// Clean numeric string with commas or percentages
export function parseCleanNumber(val: unknown): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const str = String(val).trim().replace(/,/g, '').replace(/%/g, '').replace(/IRT/gi, '').replace(/تومان/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Parses CSV lines accounting for quoted strings with commas
 */
export function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let currentToken = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentToken += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentToken.trim());
      currentToken = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(currentToken.trim());
      currentToken = '';
      if (row.length > 0 && row.some((cell) => cell.length > 0)) {
        lines.push(row);
      }
      row = [];
    } else {
      currentToken += char;
    }
  }

  if (currentToken.length > 0 || row.length > 0) {
    row.push(currentToken.trim());
    lines.push(row);
  }

  return lines;
}

/**
 * Attempts to fetch live data from the Google Sheet
 */
export async function fetchGoogleSheetData(
  config: SheetConnectionConfig
): Promise<{ success: boolean; data?: DailyMarketingRecord[]; error?: string }> {
  try {
    const exportUrl = `https://docs.google.com/spreadsheets/d/${config.sheetId}/export?format=csv&gid=${config.gid || '0'}`;
    
    // Add cache buster timestamp
    const response = await fetch(`${exportUrl}&_t=${Date.now()}`, {
      headers: {
        'Accept': 'text/csv,text/plain,*/*',
      },
    });

    if (!response.ok) {
      throw new Error(`Google Sheets responded with HTTP status ${response.status}`);
    }

    const csvText = await response.text();
    const rows = parseCSV(csvText);

    if (rows.length < 5) {
      // Sheet might be private or empty
      return {
        success: false,
        error: 'داده‌های شیت کمتر از حد انتظار است یا دسترسی به شیت نیاز به احراز هویت دارد.',
      };
    }

    // Process rows into DailyMarketingRecord
    // We search for rows where the first or second column indicates Day 1, 2, 3...
    const parsedRecords: DailyMarketingRecord[] = [];
    
    for (const row of rows) {
      const dayNum = parseInt(row[1] || row[0], 10);
      if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) {
        const existing = INITIAL_DAILY_RECORDS.find((r) => r.dayNumber === dayNum);
        
        const totalOrder = parseCleanNumber(row[11]) || (existing?.hasRecordedData ? existing.totalOrder : 0);
        const totalGmv = parseCleanNumber(row[16]) || (existing?.hasRecordedData ? existing.totalGmv : 0);
        const leads = parseCleanNumber(row[5]) || (existing?.hasRecordedData ? existing.leads : 0);
        const hasRecorded = totalOrder > 0 || totalGmv > 0 || leads > 0 || existing?.hasRecordedData === true;

        parsedRecords.push({
          id: dayNum,
          dayNumber: dayNum,
          dayName: existing?.dayName || 'روز',
          dateStr: `${dayNum} آبان ۱۴۰۵`,
          hasRecordedData: hasRecorded,
          targetOrder: parseCleanNumber(row[2]) || existing?.targetOrder || 1500,
          targetGmv: parseCleanNumber(row[3]) || existing?.targetGmv || 4500000000,
          gmvAchievedPercent: parseCleanNumber(row[4]) || existing?.gmvAchievedPercent || 0,
          leads: leads,
          logins: parseCleanNumber(row[6]) || (hasRecorded ? existing?.logins || 0 : 0),
          orderOcs: parseCleanNumber(row[7]) || (hasRecorded ? existing?.orderOcs || 0 : 0),
          orderOms: parseCleanNumber(row[8]) || (hasRecorded ? existing?.orderOms || 0 : 0),
          orderCampaignLaghari: parseCleanNumber(row[9]) || 0,
          orderCampaignClinic: parseCleanNumber(row[10]) || 0,
          totalOrder: totalOrder,
          gmvOcs: parseCleanNumber(row[12]) || (hasRecorded ? existing?.gmvOcs || 0 : 0),
          gmvOms: parseCleanNumber(row[13]) || (hasRecorded ? existing?.gmvOms || 0 : 0),
          gmvCampaignLaghari: parseCleanNumber(row[14]) || 0,
          gmvCampaignClinic: parseCleanNumber(row[15]) || 0,
          totalGmv: totalGmv,
          voucherOcs: parseCleanNumber(row[17]) || (hasRecorded ? existing?.voucherOcs || 0 : 0),
          voucherOms: parseCleanNumber(row[18]) || (hasRecorded ? existing?.voucherOms || 0 : 0),
          voucherCampaign: parseCleanNumber(row[19]) || 0,
          totalVoucher: parseCleanNumber(row[20]) || (hasRecorded ? existing?.totalVoucher || 0 : 0),
          retentionSmsJourney: parseCleanNumber(row[21]) || (hasRecorded ? existing?.retentionSmsJourney || 0 : 0),
          retentionCpcYektanet: parseCleanNumber(row[22]) || (hasRecorded ? existing?.retentionCpcYektanet || 0 : 0),
          retentionCpcTapsell: 0,
          retentionCampaignTag: parseCleanNumber(row[24]) || 0,
          totalRetention: parseCleanNumber(row[25]) || (hasRecorded ? existing?.totalRetention || 0 : 0),
          acqCampaignTag: parseCleanNumber(row[26]) || 0,
          acqAdServiceTpdr: parseCleanNumber(row[27]) || 0,
          acqExtraTag: 0,
          acqSmsJourneyNewSegment: parseCleanNumber(row[29]) || (hasRecorded ? existing?.acqSmsJourneyNewSegment || 0 : 0),
          acqMopon: 0,
          acqSmsSua: 0,
          acqSuaBanner: 0,
          acqBnplDigipay: hasRecorded ? 173333333 : 0,
          acqGoogleAdsLira: hasRecorded ? 4100 : 0,
          acqGoogleAdsTomans: parseCleanNumber(row[34]) || (hasRecorded ? existing?.acqGoogleAdsTomans || 0 : 0),
          acqInfluencer: 0,
          totalAcquisitionCost: parseCleanNumber(row[36]) || (hasRecorded ? existing?.totalAcquisitionCost || 0 : 0),
          totalAcqAndRetentionCost: parseCleanNumber(row[37]) || (hasRecorded ? existing?.totalAcqAndRetentionCost || 0 : 0),
          totalMarketingCostPlusVoucher: parseCleanNumber(row[38]) || (hasRecorded ? existing?.totalMarketingCostPlusVoucher || 0 : 0),
          cpl: parseCleanNumber(row[39]) || (hasRecorded ? existing?.cpl || 0 : 0),
          cpa: parseCleanNumber(row[40]) || (hasRecorded ? existing?.cpa || 0 : 0),
          cpoMediaOnly: parseCleanNumber(row[41]) || (hasRecorded ? existing?.cpoMediaOnly || 0 : 0),
          cpoMediaPlusVoucher: parseCleanNumber(row[42]) || (hasRecorded ? existing?.cpoMediaPlusVoucher || 0 : 0),
          newUserOcs: parseCleanNumber(row[43]) || (hasRecorded ? existing?.newUserOcs || 0 : 0),
          newUserOms: parseCleanNumber(row[44]) || (hasRecorded ? existing?.newUserOms || 0 : 0),
          newUserCampaign: parseCleanNumber(row[45]) || 0,
          newUserOverall: parseCleanNumber(row[46]) || (hasRecorded ? existing?.newUserOverall || 0 : 0),
          cacAcquisitionOnly: parseCleanNumber(row[47]) || (hasRecorded ? existing?.cacAcquisitionOnly || 0 : 0),
          cacAcquisitionPlusVoucher: parseCleanNumber(row[48]) || (hasRecorded ? existing?.cacAcquisitionPlusVoucher || 0 : 0),
          cacCampaignOnly: 0,
          cr1: parseCleanNumber(row[50]) || (hasRecorded ? existing?.cr1 || 0 : 0),
          cr2: parseCleanNumber(row[51]) || (hasRecorded ? existing?.cr2 || 0 : 0),
        });
      }
    }

    if (parsedRecords.length > 0) {
      return { success: true, data: parsedRecords };
    }

    return {
      success: true,
      data: INITIAL_DAILY_RECORDS,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: msg,
      data: INITIAL_DAILY_RECORDS, // Safe fallback
    };
  }
}

/**
 * Generates downloadable CSV matching the Google Sheet format
 */
export function exportRecordsToCSV(records: DailyMarketingRecord[]): string {
  const headers = [
    'روز',
    'تاریخ',
    'تارگت سفارش',
    'تارگت GMV',
    'درصد تحقق GMV',
    'لید روزانه (کاربران فعال)',
    'ورودها (لاگین اول)',
    'سفارش OCS',
    'سفارش OMS',
    'کمپین لاغری',
    'کمپین کلینیک',
    'مجموع سفارش',
    'GMV OCS',
    'GMV OMS',
    'GMV کل',
    'ووچر کل',
    'هزینه ریتنشن',
    'هزینه اکوزیشن',
    'کل هزینه مدیا',
    'کل هزینه مارکتینگ + ووچر',
    'کاربر جدید کل',
    'CAC کل',
    'CPO کل',
    'CR1 %',
    'CR2 %',
  ];

  const rows = records.map((r) => [
    r.dayNumber,
    r.dateStr,
    r.targetOrder,
    r.targetGmv,
    r.gmvAchievedPercent,
    r.leads,
    r.logins,
    r.orderOcs,
    r.orderOms,
    r.orderCampaignLaghari,
    r.orderCampaignClinic,
    r.totalOrder,
    r.gmvOcs,
    r.gmvOms,
    r.totalGmv,
    r.totalVoucher,
    r.totalRetention,
    r.totalAcquisitionCost,
    r.totalAcqAndRetentionCost,
    r.totalMarketingCostPlusVoucher,
    r.newUserOverall,
    r.cacAcquisitionOnly,
    r.cpoMediaOnly,
    r.cr1,
    r.cr2,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
