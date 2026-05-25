export type ContractType = "temp" | "fixed" | "intern" | "probono" | "outsourcing" | "subcontractor";

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  temp:          "Temporary Contract",
  fixed:         "Fixed-Term Contract",
  intern:        "Internship Contract",
  probono:       "Pro Bono Contract",
  outsourcing:   "Outsourcing Contract",
  subcontractor: "Sub-Contractor Contract",
};

export interface TempContractContent {
  // Document
  documentTitle: string;
  ref: string;

  // Employment period
  startDate: string;
  endDate: string;

  // Employer
  employerName: string;
  employerTradingAs: string;
  employerAddress: string;
  employerEmail: string;
  employerPhone: string;
  employerRepName: string;
  employerRepTitle: string;

  // Employee (can be linked to employees table)
  employeeDbId?: string;
  employeeName: string;
  employeeIdNumber: string;
  employeeAddress: string;
  employeeEmail: string;
  employeePhone: string;

  // Position
  jobTitle: string;
  department: string;
  reportingTo: string;
  workLocation: string;
  reasonForTemp: string;

  // Remuneration
  rateAmount: string;
  ratePeriod: string;
  paymentSchedule: string;
  paymentMethod: string;

  // Working hours
  workingHours: string;
  hoursPerWeek: string;
  overtimeRate: string;

  // Sections
  duties: string[];
  leaveTerms: string[];
  terminationTerms: string[];
  confidentialityTerms: string[];
  generalTerms: string[];

  // Closing
  closingStatement: string;
}

export interface EmployeeRef {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  department: string;
}

export interface EmployeeContractRecord {
  id: string;
  name: string;
  contract_type: ContractType;
  content: TempContractContent;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const SHARED_EMPLOYER = {
  employerName: "Keenan Husselmann",
  employerTradingAs: "Swift Designz",
  employerAddress: "As per registered business address",
  employerEmail: "keenan@swiftdesignz.co.za",
  employerPhone: "+264 81 853 6789",
  employerRepName: "Keenan Husselmann",
  employerRepTitle: "Director",
};

export const DEFAULT_TEMP_CONTRACT: TempContractContent = {
  documentTitle: "Temporary Employment Contract",
  ref: "SD-TEC-2026",
  startDate: "",
  endDate: "",
  ...SHARED_EMPLOYER,
  employeeDbId: undefined,
  employeeName: "",
  employeeIdNumber: "",
  employeeAddress: "",
  employeeEmail: "",
  employeePhone: "",
  jobTitle: "",
  department: "",
  reportingTo: "Keenan Husselmann",
  workLocation: "Remote / As Agreed",
  reasonForTemp: "To fulfil a temporary operational requirement for Swift Designz.",
  rateAmount: "R0",
  ratePeriod: "per month",
  paymentSchedule: "Monthly, on or before the last business day of each month.",
  paymentMethod: "EFT. Payment reference must include the employee name and month.",
  workingHours: "08:00 to 17:00, Monday to Friday",
  hoursPerWeek: "45",
  overtimeRate: "Overtime is compensated at 1.5× the normal hourly rate for work exceeding 45 hours per week, as prescribed by the BCEA.",
  duties: [
    "Perform all tasks assigned by the Employer in a professional and diligent manner.",
    "Adhere to company policies, procedures, and codes of conduct.",
    "Maintain the confidentiality of all business, client, and operational information.",
    "Report to the designated line manager and attend required meetings.",
    "Return all company property and access credentials upon contract end or termination.",
  ],
  leaveTerms: [
    "Annual leave: 1 day per 17 days worked, as prescribed by the BCEA (Section 20).",
    "Sick leave: 1 day per 26 days worked during the first 6 months, then 30 days per 36-month cycle.",
    "Public holidays: The Employee is entitled to all public holidays gazetted by the Republic of South Africa.",
    "Leave must be requested in writing at least 3 business days in advance (except for sick leave).",
    "Leave days accrued but not taken by the contract end date are forfeited unless otherwise agreed in writing.",
  ],
  terminationTerms: [
    "This contract terminates automatically on the agreed end date without further notice.",
    "Either party may terminate before the end date by providing 1 (one) week's written notice via email.",
    "The Employer may terminate immediately and without notice for serious misconduct, dishonesty, gross negligence, or material breach of these terms.",
    "Upon termination, the Employee must return all company property, credentials, and access within 1 business day.",
    "The Employee will be registered for UIF and is entitled to claim upon termination where applicable.",
  ],
  confidentialityTerms: [
    "The Employee agrees not to disclose any confidential business information, client data, or trade secrets during or after this contract.",
    "Confidential information includes, but is not limited to: client lists, pricing, source code, financial data, project details, and internal processes.",
    "This confidentiality obligation remains in force for 12 (twelve) months after the contract end date.",
    "Breach of confidentiality may result in immediate termination and civil legal action for damages.",
  ],
  generalTerms: [
    "This Agreement is governed by the laws of the Republic of South Africa, including the Basic Conditions of Employment Act (BCEA) and Labour Relations Act (LRA).",
    "Both parties confirm they have read and understood this Agreement before signing.",
    "Amendments must be agreed in writing and signed by both parties to be valid.",
    "This contract supersedes all prior verbal or written discussions regarding this employment.",
    "UIF contributions will be deducted from the Employee's remuneration and submitted to the relevant authority by the Employer.",
    "This Agreement is subject to Swift Designz Terms & Conditions (SD-TC-2026), incorporated by reference.",
  ],
  closingStatement:
    "By signing below, both parties confirm they have read, understood, and agreed to the terms of this Temporary Employment Contract. This Agreement is legally binding from the date of the last signature.",
};
