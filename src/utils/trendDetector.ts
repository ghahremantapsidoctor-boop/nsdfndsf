import { DailyMarketingRecord, TrendAlert, AlertSeverity } from '../types/marketing';
import { formatCompactToman, formatCurrencyIRT, formatPercent, toPersianDigits } from './formatters';

export function analyzeTrendAlerts(
  records: DailyMarketingRecord[],
  targetCac = 908013
): TrendAlert[] {
  const alerts: TrendAlert[] = [];

  // Filter only records that have actual recorded data and sort by dayNumber
  const validRecords = records
    .filter((r) => r.hasRecordedData !== false && (r.totalOrder > 0 || r.totalGmv > 0))
    .sort((a, b) => a.dayNumber - b.dayNumber);

  if (validRecords.length === 0) return alerts;

  // 1. Analyze Day 1 milestone/spike if applicable
  const firstDay = validRecords[0];
  if (firstDay && firstDay.gmvAchievedPercent >= 150) {
    alerts.push({
      id: `alert_spike_d${firstDay.dayNumber}_gmv`,
      dayNumber: firstDay.dayNumber,
      dateStr: firstDay.dateStr,
      metric: 'gmv',
      metricTitle: 'فروش روز اول (GMV)',
      severity: 'positive',
      type: 'spike',
      percentChange: firstDay.gmvAchievedPercent - 100,
      currentValue: firstDay.totalGmv,
      previousValue: firstDay.targetGmv,
      title: `جهش فوق‌العاده در روز ${toPersianDigits(firstDay.dayNumber)} (${formatPercent(firstDay.gmvAchievedPercent)} تارگت)`,
      description: `فروش کل به ${formatCompactToman(firstDay.totalGmv)} رسید که بیش از ۲.۵ برابر تارگت پیش‌بینی شده بود.`,
      recommendation: 'بررسی عوامل موفقیت کمپین‌های لانچ در روز اول جهت تکرار در روزهای آتی.',
    });
  }

  // 2. Iterate Day-over-Day comparisons
  for (let i = 1; i < validRecords.length; i++) {
    const prev = validRecords[i - 1];
    const curr = validRecords[i];

    // GMV Change %
    if (prev.totalGmv > 0) {
      const gmvChange = ((curr.totalGmv - prev.totalGmv) / prev.totalGmv) * 100;

      // Significant Drop: <= -20%
      if (gmvChange <= -20) {
        alerts.push({
          id: `alert_drop_d${curr.dayNumber}_gmv`,
          dayNumber: curr.dayNumber,
          dateStr: curr.dateStr,
          metric: 'gmv',
          metricTitle: 'فروش کل (GMV)',
          severity: 'critical',
          type: 'drop',
          percentChange: Number(gmvChange.toFixed(1)),
          currentValue: curr.totalGmv,
          previousValue: prev.totalGmv,
          title: `افت شدید فروش روز ${toPersianDigits(curr.dayNumber)} (${toPersianDigits(Math.abs(gmvChange).toFixed(1))}٪- نسبت به روز قبل)`,
          description: `فروش از ${formatCompactToman(prev.totalGmv)} در روز ${toPersianDigits(prev.dayNumber)} به ${formatCompactToman(curr.totalGmv)} کاهش یافت.`,
          recommendation: 'بررسی سلامت درگاه‌های پرداخت، پیامک‌های ارسالی، و عملکرد بخش OMS و تامین‌کنندگان.',
        });
      }
      // Notable Drop: between -15% and -20%
      else if (gmvChange <= -15) {
        alerts.push({
          id: `alert_warn_d${curr.dayNumber}_gmv`,
          dayNumber: curr.dayNumber,
          dateStr: curr.dateStr,
          metric: 'gmv',
          metricTitle: 'فروش کل (GMV)',
          severity: 'warning',
          type: 'drop',
          percentChange: Number(gmvChange.toFixed(1)),
          currentValue: curr.totalGmv,
          previousValue: prev.totalGmv,
          title: `کاهش محسوس فروش در روز ${toPersianDigits(curr.dayNumber)} (${toPersianDigits(Math.abs(gmvChange).toFixed(1))}٪-)`,
          description: `فروش کل روزانه با افت ${formatCompactToman(prev.totalGmv - curr.totalGmv)} همراه بوده است.`,
        });
      }
      // Positive Spike: >= +25%
      else if (gmvChange >= 25) {
        alerts.push({
          id: `alert_spike_d${curr.dayNumber}_gmv`,
          dayNumber: curr.dayNumber,
          dateStr: curr.dateStr,
          metric: 'gmv',
          metricTitle: 'فروش کل (GMV)',
          severity: 'positive',
          type: 'spike',
          percentChange: Number(gmvChange.toFixed(1)),
          currentValue: curr.totalGmv,
          previousValue: prev.totalGmv,
          title: `جهش مثبت فروش در روز ${toPersianDigits(curr.dayNumber)} (${toPersianDigits(gmvChange.toFixed(1))}٪+)`,
          description: `افزایش فروش از ${formatCompactToman(prev.totalGmv)} به ${formatCompactToman(curr.totalGmv)}.`,
        });
      }
    }

    // Orders Change %
    if (prev.totalOrder > 0) {
      const orderChange = ((curr.totalOrder - prev.totalOrder) / prev.totalOrder) * 100;
      if (orderChange <= -18) {
        alerts.push({
          id: `alert_drop_d${curr.dayNumber}_order`,
          dayNumber: curr.dayNumber,
          dateStr: curr.dateStr,
          metric: 'order',
          metricTitle: 'سفارش‌ها',
          severity: 'critical',
          type: 'drop',
          percentChange: Number(orderChange.toFixed(1)),
          currentValue: curr.totalOrder,
          previousValue: prev.totalOrder,
          title: `افت قابل‌توجه سفارش‌ها در روز ${toPersianDigits(curr.dayNumber)} (${toPersianDigits(Math.abs(orderChange).toFixed(1))}٪-)`,
          description: `تعداد سفارش‌ها از ${formatCurrencyIRT(prev.totalOrder)} به ${formatCurrencyIRT(curr.totalOrder)} سفارش کاهش یافته است.`,
          recommendation: 'بررسی موجودی کالاها در OMS و بازبینی پیشنهادات تخفیفی و شارژ ووچر.',
        });
      } else if (orderChange >= 25) {
        alerts.push({
          id: `alert_spike_d${curr.dayNumber}_order`,
          dayNumber: curr.dayNumber,
          dateStr: curr.dateStr,
          metric: 'order',
          metricTitle: 'سفارش‌ها',
          severity: 'positive',
          type: 'spike',
          percentChange: Number(orderChange.toFixed(1)),
          currentValue: curr.totalOrder,
          previousValue: prev.totalOrder,
          title: `جهش تعداد سفارش‌ها در روز ${toPersianDigits(curr.dayNumber)} (${toPersianDigits(orderChange.toFixed(1))}٪+)`,
          description: `رشد سفارش‌ها به ${formatCurrencyIRT(curr.totalOrder)} سفارش با رشد مثبت نسبت به روز قبل.`,
        });
      }
    }

    // CAC Surge vs Target & Previous Day
    if (curr.cacAcquisitionOnly > targetCac * 2.2) {
      const surgePercent = ((curr.cacAcquisitionOnly - targetCac) / targetCac) * 100;
      alerts.push({
        id: `alert_surge_d${curr.dayNumber}_cac`,
        dayNumber: curr.dayNumber,
        dateStr: curr.dateStr,
        metric: 'cac',
        metricTitle: 'هزینه جذب کاربر جدید (CAC)',
        severity: 'critical',
        type: 'surge',
        percentChange: Number(surgePercent.toFixed(1)),
        currentValue: curr.cacAcquisitionOnly,
        previousValue: targetCac,
        title: `جهش نگران‌کننده CAC در روز ${toPersianDigits(curr.dayNumber)} (${formatCompactToman(curr.cacAcquisitionOnly)})`,
        description: `هزینه جذب کاربر بیش از ۲ برابر تارگت مصوب (${formatCompactToman(targetCac)}) شده است (افزایش ${toPersianDigits(surgePercent.toFixed(0))}٪).`,
        recommendation: 'بررسی اثربخشی بودجه‌های تبلیغاتی پرهزینه مانند اس‌ام‌اس‌های سگمنت جدید و اصلاح کانال‌های کم‌بازده.',
      });
    }

    // Conversion Drop: CR2 (Logins to Orders)
    if (prev.cr2 > 0 && curr.cr2 < prev.cr2 * 0.78) {
      const crDrop = ((curr.cr2 - prev.cr2) / prev.cr2) * 100;
      alerts.push({
        id: `alert_drop_d${curr.dayNumber}_cr2`,
        dayNumber: curr.dayNumber,
        dateStr: curr.dateStr,
        metric: 'cr',
        metricTitle: 'نرخ تبدیل (CR2)',
        severity: 'warning',
        type: 'drop',
        percentChange: Number(crDrop.toFixed(1)),
        currentValue: curr.cr2,
        previousValue: prev.cr2,
        title: `کاهش نرخ تبدیل لاگین به سفارش در روز ${toPersianDigits(curr.dayNumber)}`,
        description: `نرخ تبدیل CR2 از ${toPersianDigits(prev.cr2.toFixed(1))}٪ به ${toPersianDigits(curr.cr2.toFixed(1))}٪ کاهش یافته است.`,
        recommendation: 'بررسی مسیر ثبت سفارش (UX)، سرعت باز شدن لندینگ‌ها و کوپن‌های منقضی.',
      });
    }
  }

  // Sort alerts with critical first, then recent days first
  return alerts.sort((a, b) => {
    if (a.severity === 'critical' && b.severity !== 'critical') return -1;
    if (b.severity === 'critical' && a.severity !== 'critical') return 1;
    return b.dayNumber - a.dayNumber;
  });
}

/**
 * Calculates Day-over-Day delta for the latest recorded day
 */
export function getLatestDayDelta(records: DailyMarketingRecord[]): {
  latestDay: DailyMarketingRecord | null;
  previousDay: DailyMarketingRecord | null;
  gmvChangePercent: number;
  ordersChangePercent: number;
  cacChangePercent: number;
  cr2ChangePercent: number;
} {
  const valid = records
    .filter((r) => r.hasRecordedData !== false && (r.totalOrder > 0 || r.totalGmv > 0))
    .sort((a, b) => a.dayNumber - b.dayNumber);

  if (valid.length < 2) {
    const latest = valid[0] || null;
    return {
      latestDay: latest,
      previousDay: null,
      gmvChangePercent: 0,
      ordersChangePercent: 0,
      cacChangePercent: 0,
      cr2ChangePercent: 0,
    };
  }

  const latest = valid[valid.length - 1];
  const previous = valid[valid.length - 2];

  const gmvChangePercent = previous.totalGmv > 0 ? ((latest.totalGmv - previous.totalGmv) / previous.totalGmv) * 100 : 0;
  const ordersChangePercent = previous.totalOrder > 0 ? ((latest.totalOrder - previous.totalOrder) / previous.totalOrder) * 100 : 0;
  const cacChangePercent = previous.cacAcquisitionOnly > 0 ? ((latest.cacAcquisitionOnly - previous.cacAcquisitionOnly) / previous.cacAcquisitionOnly) * 100 : 0;
  const cr2ChangePercent = previous.cr2 > 0 ? ((latest.cr2 - previous.cr2) / previous.cr2) * 100 : 0;

  return {
    latestDay: latest,
    previousDay: previous,
    gmvChangePercent: Number(gmvChangePercent.toFixed(1)),
    ordersChangePercent: Number(ordersChangePercent.toFixed(1)),
    cacChangePercent: Number(cacChangePercent.toFixed(1)),
    cr2ChangePercent: Number(cr2ChangePercent.toFixed(1)),
  };
}
