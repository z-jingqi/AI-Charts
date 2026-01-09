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
- key: Short identifier in lowercase with underscores (e.g., "wbc", "blood_pressure_systolic", "total_cholesterol")
- name: Full human-readable name (e.g., "White Blood Cell Count", "Blood Pressure (Systolic)", "Total Cholesterol")
- value: Numerical value
- unit: Unit of measurement (e.g., "10^3/μL", "mmHg", "mg/dL")
- status: "normal", "high", "low", "positive", or "negative" based on reference ranges
- reference: Reference range if provided (e.g., "3.5-9.5", "< 200", "Negative")
- notes: Any additional context (e.g., "Fasting", "Post-exercise") [optional]
- displayOrder: Sequential number (0, 1, 2, ...) to maintain the order they appear in the document
- categoryTag: Panel/group name if tests are related (e.g., "liver_function", "cholesterol_panel", "kidney_function", "complete_blood_count") [optional]
- parentKey: Usually null for health data (flat structure) [optional]

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

Extract ALL numerical health metrics with:
- key: Short identifier in lowercase with underscores (e.g., "wbc", "glucose_fasting")
- name: Full human-readable name (e.g., "White Blood Cell Count", "Fasting Glucose")
- value: Numerical value
- unit: Unit of measurement
- status: "normal", "high", "low", "positive", or "negative"
- reference: Reference range if provided (e.g., "3.5-9.5", "Negative")
- notes: Any additional context [optional]
- displayOrder: Sequential number to maintain order
- categoryTag: Panel/group name if tests are related (e.g., "liver_function") [optional]
- parentKey: Usually null for health data [optional]

Output format:
- type: "health"
- category: "lab" | "vital" | "imaging" | "prescription" | "other"
- date: ISO date string
- summary: Brief description
- items: Array of metrics (key, name, value, unit, status)`;

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
- key: Short identifier in lowercase with underscores (e.g., "total_amount", "account_balance", "tax_paid", "item_1", "item_2")
- name: Full human-readable name (e.g., "Total Amount", "Account Balance", "Tax Paid", "Coffee", "Sandwich")
- value: Numerical value (can be negative for expenses)
- unit: Currency or unit (e.g., "USD", "EUR", "JPY")
- status: "income" | "expense" | "neutral"
- reference: Expected or budgeted amount if mentioned [optional]
- notes: Any additional context (e.g., "includes tax", "payment method: card") [optional]
- displayOrder: Sequential number to maintain order
- categoryTag: Expense category (e.g., "food_drink", "transport", "entertainment", "utilities", "healthcare", "shopping") [optional]
- parentKey: For line items, reference the parent key (e.g., if this is a line item under "subtotal", set parentKey="subtotal") [optional]

For invoices/bills with line items, structure hierarchically:
Example Invoice:
- Total (key="total", parentKey=null)
  - Subtotal (key="subtotal", parentKey="total")
    - Coffee (key="item_coffee", parentKey="subtotal", categoryTag="food_drink")
    - Sandwich (key="item_sandwich", parentKey="subtotal", categoryTag="food_drink")
  - Tax (key="tax", parentKey="total")

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

Extract ALL financial metrics with:
- key: Short identifier in lowercase with underscores (e.g., "total_amount", "net_income")
- name: Full human-readable name (e.g., "Total Amount", "Net Income")
- value: Numerical value
- unit: Currency or unit
- status: "income" | "expense" | "neutral"
- reference: Expected or budgeted amount if mentioned [optional]
- notes: Any additional context [optional]
- displayOrder: Sequential number to maintain order
- categoryTag: Expense category (e.g., "food_drink", "transport", "entertainment") [optional]
- parentKey: For line items, reference the parent key [optional]

Output format:
- type: "finance"
- category: "transaction" | "statement" | "invoice" | "investment" | "tax" | "other"
- date: ISO date string
- summary: Brief description
- items: Array of metrics (key, name, value, unit, status)`;

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
