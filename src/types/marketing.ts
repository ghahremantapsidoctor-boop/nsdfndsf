/**
 * Marketing Intelligence Data Types for Tapsi Doctor (TPDR)
 */

export interface DailyMarketingRecord {
  id: number;
  dayNumber: number; // 1 to 30 of Aban
  dayName: string; // جمعه، شنبه، ...
  dateStr: string; // 1405/08/01
  hasRecordedData?: boolean; // True if real performance data exists in sheet

  // Target Prediction
  targetOrder: number;
  targetGmv: number;
  gmvAchievedPercent: number;

  // Funnel Events GA4 + MTBS
  leads: number; // Top Of the Funnel Lead (Day Active users)
  logins: number; // Logins (first)

  // Sales (Order) Payment Sales
  orderOcs: number;
  orderOms: number;
  orderCampaignLaghari: number;
  orderCampaignClinic: number;
  totalOrder: number;

  // Sales (GMV) (IRT) Payment Sales
  gmvOcs: number; // OCS Tariff Table
  gmvOms: number; // OMS VendorSide
  gmvCampaignLaghari: number;
  gmvCampaignClinic: number;
  totalGmv: number;

  // Voucher (IRT)
  voucherOcs: number;
  voucherOms: number;
  voucherCampaign: number;
  totalVoucher: number;

  // Retention (IRT)
  retentionSmsJourney: number;
  retentionCpcYektanet: number;
  retentionCpcTapsell: number;
  retentionCampaignTag: number;
  totalRetention: number;

  // Media Cost Acquisition (IRT)
  acqCampaignTag: number;
  acqAdServiceTpdr: number;
  acqExtraTag: number;
  acqSmsJourneyNewSegment: number;
  acqMopon: number;
  acqSmsSua: number;
  acqSuaBanner: number;
  acqBnplDigipay: number;
  acqGoogleAdsLira: number;
  acqGoogleAdsTomans: number;
  acqInfluencer: number;
  totalAcquisitionCost: number;
  totalAcqAndRetentionCost: number;
  totalMarketingCostPlusVoucher: number;

  // CPO (IRT)
  cpl: number; // Cost per Day Active user
  cpa: number; // Cost per Login
  cpoMediaOnly: number;
  cpoMediaPlusVoucher: number;

  // CAC (IRT)
  newUserOcs: number;
  newUserOms: number;
  newUserCampaign: number;
  newUserOverall: number;
  cacAcquisitionOnly: number;
  cacAcquisitionPlusVoucher: number;
  cacCampaignOnly: number;

  // Conversion Rates
  cr1: number; // CR1: Order / Leads %
  cr2: number; // CR2: Order / Logins %
}

export type AlertSeverity = 'critical' | 'warning' | 'positive' | 'info';

export interface TrendAlert {
  id: string;
  dayNumber: number;
  dateStr: string;
  metric: 'gmv' | 'order' | 'cac' | 'cr' | 'leads';
  metricTitle: string;
  severity: AlertSeverity;
  type: 'drop' | 'spike' | 'surge' | 'milestone';
  percentChange: number;
  currentValue: number;
  previousValue: number;
  title: string;
  description: string;
  recommendation?: string;
}

export interface MonthlyMarketingPlan {
  monthName: string;
  targetOrder: number;
  targetGmv: number;
  targetMarketingBudget: number;
  targetAov: number;
  targetCac: number;
  targetNewUsers: number;
  targetCrAcquisition: number;
  channelShares: {
    channel: string;
    targetOrders: number;
    sharePercent: number;
    budget: number;
  }[];
  weeklyPlans: {
    week: string;
    daysRange: string;
    targetOrder: number;
    targetGmv: number;
    marketingBudget: number;
  }[];
}

export type UserRole = 'super_admin' | 'marketing_lead' | 'campaign_specialist' | 'viewer';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  has2FA: boolean;
  twoFactorSecret?: string;
  status: 'active' | 'suspended';
  lastLogin?: string;
}

export interface SheetConnectionConfig {
  sheetId: string;
  gid: string;
  tabName: string;
  usePublicCsv: boolean;
  googleApiKey?: string;
  autoSync: boolean;
  syncIntervalSeconds: number;
  lastSyncTime: string | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  errorMessage?: string;
  onlyRecordedDays: boolean; // "روزهایی که دیتایی در شیت ثبت نشده نباید در دشابورد هم نمایش داده بشه"
}
