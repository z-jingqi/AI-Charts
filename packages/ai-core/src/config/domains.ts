/**
 * Domain Configuration System
 * Defines extraction prompts and validation rules for different data domains
 */

/**
 * Supported data domains
 */
export type DataDomain = 'health' | 'finance';

/**
 * Domain-specific extraction configuration
 */
export interface DomainConfig {
  domain: DataDomain;
  imagePrompt: string;
  textPrompt: string;
  categories: string[];
}

/**
 * Health domain extraction prompt for images
 */
const HEALTH_IMAGE_PROMPT = `You are a medical data extraction expert. Extract health/medical information from the image.

Focus on:
- Lab test results (CBC, metabolic panel, lipid panel, etc.)
- Vital signs (blood pressure, heart rate, temperature, etc.)
- Medical measurements (weight, height, BMI, etc.)
- Diagnostic test results (X-ray findings, ultrasound results, etc.)
- Prescription information (if visible)

Extract ALL numerical values with their:
- Key name (e.g., "White Blood Cell Count", "Blood Pressure Systolic")
- Value (numerical)
- Unit (e.g., "10^3/μL", "mmHg", "mg/dL")
- Status: "normal", "high", "low", or "critical" based on reference ranges

Provide:
- type: "health"
- category: "lab" | "vital" | "imaging" | "prescription" | "other"
- date: ISO date string (YYYY-MM-DD) from the report
- summary: Brief description of the report
- items: Array of all extracted metrics`;

/**
 * Health domain extraction prompt for text
 */
const HEALTH_TEXT_PROMPT = `You are a medical data extraction expert. Extract structured health data from the provided text.

The text may contain:
- Lab test results with reference ranges
- Vital signs measurements
- Medical observations and diagnoses
- Prescription details

Extract ALL numerical health metrics with their units and status indicators. Classify the data appropriately and provide a concise summary.

Output format:
- type: "health"
- category: "lab" | "vital" | "imaging" | "prescription" | "other"
- date: ISO date string
- summary: Brief description
- items: Array of metrics (key, value, unit, status)`;

/**
 * Finance domain extraction prompt for images
 */
const FINANCE_IMAGE_PROMPT = `You are a financial data extraction expert. Extract financial information from the image.

Focus on:
- Bank statements (transactions, balances, account details)
- Receipts and invoices (merchant, amount, items, tax)
- Credit card statements (charges, payments, interest)
- Investment statements (holdings, performance, dividends)
- Tax documents (income, deductions, payments)

Extract ALL financial values with their:
- Key name (e.g., "Total Amount", "Account Balance", "Tax Paid")
- Value (numerical, can be negative for expenses)
- Unit (e.g., "USD", "EUR", "JPY")
- Status: "income" | "expense" | "neutral"

Provide:
- type: "finance"
- category: "transaction" | "statement" | "invoice" | "investment" | "tax" | "other"
- date: ISO date string (YYYY-MM-DD) from the document
- summary: Brief description of the financial document
- items: Array of all extracted financial metrics`;

/**
 * Finance domain extraction prompt for text
 */
const FINANCE_TEXT_PROMPT = `You are a financial data extraction expert. Extract structured financial data from the provided text.

The text may contain:
- Transaction details (date, merchant, amount, category)
- Account statements (balances, credits, debits)
- Investment information (securities, prices, returns)
- Tax-related data (income, deductions, credits)

Extract ALL financial metrics with their currency/units and classify as income, expense, or neutral. Provide a concise summary of the financial document.

Output format:
- type: "finance"
- category: "transaction" | "statement" | "invoice" | "investment" | "tax" | "other"
- date: ISO date string
- summary: Brief description
- items: Array of metrics (key, value, unit, status)`;

/**
 * Domain configuration registry
 */
export const DOMAIN_CONFIGS: Record<DataDomain, DomainConfig> = {
  health: {
    domain: 'health',
    imagePrompt: HEALTH_IMAGE_PROMPT,
    textPrompt: HEALTH_TEXT_PROMPT,
    categories: ['lab', 'vital', 'imaging', 'prescription', 'other'],
  },
  finance: {
    domain: 'finance',
    imagePrompt: FINANCE_IMAGE_PROMPT,
    textPrompt: FINANCE_TEXT_PROMPT,
    categories: ['transaction', 'statement', 'invoice', 'investment', 'tax', 'other'],
  },
};

/**
 * Get domain configuration
 */
export function getDomainConfig(domain: DataDomain): DomainConfig {
  return DOMAIN_CONFIGS[domain];
}
