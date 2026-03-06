// XBRL tag normalization for SEC EDGAR CompanyFacts API
//
// Companies use different us-gaap tags for the same concept.
// This mapping normalizes them to a single canonical name.
// Built from analysis of S&P 500 XBRL filings.

export type FinancialMetric =
  | "revenue"
  | "costOfRevenue"
  | "grossProfit"
  | "operatingIncome"
  | "netIncome"
  | "eps"
  | "epsDiluted"
  | "totalAssets"
  | "totalLiabilities"
  | "stockholdersEquity"
  | "cash"
  | "longTermDebt"
  | "sharesOutstanding"
  | "operatingCashFlow"
  | "capitalExpenditures"
  | "freeCashFlow"
  | "dividendsPaid";

// Tags ordered by preference — first match wins
export const XBRL_TAG_MAP: Record<FinancialMetric, string[]> = {
  revenue: [
    "RevenueFromContractWithCustomerExcludingAssessedTax",
    "SalesRevenueNet",
    "Revenues",
    "RevenueFromContractWithCustomerIncludingAssessedTax",
    "SalesRevenueGoodsNet",
    "SalesRevenueServicesNet",
    "InterestAndDividendIncomeOperating", // banks
    "InterestIncomeExpenseNet", // banks
    "TotalRevenuesAndOtherIncome",
    "RegulatedAndUnregulatedOperatingRevenue", // utilities
    "HealthCareOrganizationRevenue",
    "OilAndGasRevenue",
    "ElectricUtilityRevenue",
    "RealEstateRevenueNet",
    "FinancialServicesRevenue",
    "RevenueNotFromContractWithCustomer",
  ],
  costOfRevenue: [
    "CostOfGoodsAndServicesSold",
    "CostOfRevenue",
    "CostOfGoodsSold",
    "CostOfGoodsAndServiceExcludingDepreciationDepletionAndAmortization",
  ],
  grossProfit: [
    "GrossProfit",
  ],
  operatingIncome: [
    "OperatingIncomeLoss",
    "IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest",
  ],
  netIncome: [
    "NetIncomeLoss",
    "NetIncomeLossAvailableToCommonStockholdersBasic",
    "ProfitLoss",
    "NetIncomeLossAttributableToParent",
  ],
  eps: [
    "EarningsPerShareBasic",
  ],
  epsDiluted: [
    "EarningsPerShareDiluted",
  ],
  totalAssets: [
    "Assets",
  ],
  totalLiabilities: [
    "Liabilities",
    "LiabilitiesAndStockholdersEquity", // only if Assets is missing
  ],
  stockholdersEquity: [
    "StockholdersEquity",
    "StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest",
  ],
  cash: [
    "CashAndCashEquivalentsAtCarryingValue",
    "CashCashEquivalentsAndShortTermInvestments",
    "Cash",
    "CashAndDueFromBanks", // banks
  ],
  longTermDebt: [
    "LongTermDebt",
    "LongTermDebtNoncurrent",
    "LongTermDebtAndCapitalLeaseObligations",
  ],
  sharesOutstanding: [
    "CommonStockSharesOutstanding",
    "WeightedAverageNumberOfShareOutstandingBasicAndDiluted",
    "WeightedAverageNumberOfDilutedSharesOutstanding",
    "EntityCommonStockSharesOutstanding",
  ],
  operatingCashFlow: [
    "NetCashProvidedByUsedInOperatingActivities",
    "NetCashProvidedByUsedInOperatingActivitiesContinuingOperations",
  ],
  capitalExpenditures: [
    "PaymentsToAcquirePropertyPlantAndEquipment",
    "PaymentsToAcquireProductiveAssets",
    "CapitalExpenditureDiscontinuedOperations",
  ],
  freeCashFlow: [
    // Rarely reported directly — usually calculated as operatingCashFlow - capex
  ],
  dividendsPaid: [
    "PaymentsOfDividends",
    "PaymentsOfDividendsCommonStock",
    "DividendsCommonStockCash",
    "PaymentsOfOrdinaryDividends",
  ],
};

// Unit type for each metric
export const XBRL_UNITS: Record<FinancialMetric, "USD" | "USD/shares" | "shares"> = {
  revenue: "USD",
  costOfRevenue: "USD",
  grossProfit: "USD",
  operatingIncome: "USD",
  netIncome: "USD",
  eps: "USD/shares",
  epsDiluted: "USD/shares",
  totalAssets: "USD",
  totalLiabilities: "USD",
  stockholdersEquity: "USD",
  cash: "USD",
  longTermDebt: "USD",
  sharesOutstanding: "shares",
  operatingCashFlow: "USD",
  capitalExpenditures: "USD",
  freeCashFlow: "USD",
  dividendsPaid: "USD",
};

// Balance sheet items are point-in-time (instantaneous)
// Income/cash flow items are period-based (duration)
export const BALANCE_SHEET_METRICS: FinancialMetric[] = [
  "totalAssets",
  "totalLiabilities",
  "stockholdersEquity",
  "cash",
  "longTermDebt",
  "sharesOutstanding",
];
