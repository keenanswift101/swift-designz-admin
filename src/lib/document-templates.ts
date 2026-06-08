import type { UserRole } from "@/types/database";

export type DocumentTemplateAudience = "admin" | "investor" | "employee";

export interface DocumentTemplateDefinition {
  slug: string;
  label: string;
  audiences: DocumentTemplateAudience[];
  clientGeneration: boolean;
}

export const DOCUMENT_TEMPLATES: DocumentTemplateDefinition[] = [
  { slug: "quote-template", label: "Quotation", audiences: ["admin"], clientGeneration: true },
  { slug: "invoice-template", label: "Invoice", audiences: ["admin"], clientGeneration: true },
  { slug: "nda", label: "Client NDA", audiences: ["admin"], clientGeneration: true },
  { slug: "terms-and-conditions", label: "Client Terms and Conditions", audiences: ["admin", "investor"], clientGeneration: true },
  { slug: "client-onboarding", label: "Client Onboarding", audiences: ["admin"], clientGeneration: true },
  { slug: "change-request-form", label: "Change Request Form", audiences: ["admin"], clientGeneration: true },
  { slug: "proceed-to-build", label: "Proceed to Build", audiences: ["admin"], clientGeneration: true },
  { slug: "maintenance-retainer", label: "Maintenance Retainer", audiences: ["admin"], clientGeneration: true },
  { slug: "payment-plan-agreement", label: "Payment Plan Agreement", audiences: ["admin"], clientGeneration: true },
  { slug: "project-handover", label: "Project Handover", audiences: ["admin"], clientGeneration: true },
  { slug: "estore-retainer", label: "eStore Retainer Agreement", audiences: ["admin"], clientGeneration: true },
  // Employee documents
  { slug: "company-overview",        label: "Company Overview",                audiences: ["admin", "employee"], clientGeneration: false },
  { slug: "brand-guide",             label: "Brand & Design Guidelines",        audiences: ["admin", "employee"], clientGeneration: false },
  { slug: "org-structure",           label: "Organisation Structure",           audiences: ["admin", "employee"], clientGeneration: false },
  { slug: "employee-nda",            label: "Employee Confidentiality (NDA)",   audiences: ["admin", "employee"], clientGeneration: false },
  { slug: "data-protection-policy",  label: "Data Protection Policy",           audiences: ["admin", "employee"], clientGeneration: false },
  { slug: "acceptable-use-policy",   label: "Acceptable Use Policy",            audiences: ["admin", "employee"], clientGeneration: false },
  { slug: "code-of-conduct",         label: "Code of Conduct",                  audiences: ["admin", "employee"], clientGeneration: false },
  { slug: "sop-client-onboarding",   label: "SOP: Client Onboarding",           audiences: ["admin", "employee"], clientGeneration: false },
  { slug: "sop-project-management",  label: "SOP: Project Management",          audiences: ["admin", "employee"], clientGeneration: false },
  { slug: "sop-design-process",      label: "SOP: Design Process",              audiences: ["admin", "employee"], clientGeneration: false },
  { slug: "sop-development-workflow",label: "SOP: Development Workflow",        audiences: ["admin", "employee"], clientGeneration: false },
  { slug: "sop-qa-testing",          label: "SOP: QA & Testing",                audiences: ["admin", "employee"], clientGeneration: false },
  { slug: "sop-client-communication",label: "SOP: Client Communication",        audiences: ["admin", "employee"], clientGeneration: false },
  { slug: "sop-change-request",      label: "SOP: Change Request",              audiences: ["admin", "employee"], clientGeneration: false },
  { slug: "sop-deployment",          label: "SOP: Deployment & Handover",       audiences: ["admin", "employee"], clientGeneration: false },
  { slug: "hr-leave-policy",         label: "Leave & Attendance Policy",        audiences: ["admin", "employee"], clientGeneration: false },
  { slug: "hr-remote-work",          label: "Remote Work Policy",               audiences: ["admin", "employee"], clientGeneration: false },
  { slug: "hr-expense-claims",       label: "Expense Claims Policy",            audiences: ["admin", "employee"], clientGeneration: false },
  { slug: "hr-performance-review",   label: "Performance Review Policy",        audiences: ["admin", "employee"], clientGeneration: false },
  { slug: "conflict-resolution",     label: "Conflict Resolution Policy",       audiences: ["admin", "employee"], clientGeneration: false },
  { slug: "grievance-procedure",     label: "Grievance Procedure",              audiences: ["admin", "employee"], clientGeneration: false },
  // Investor documents
  { slug: "investor-nda", label: "Investor NDA", audiences: ["admin", "investor"], clientGeneration: false },
  { slug: "investor-terms-and-conditions", label: "Investor Terms and Conditions", audiences: ["admin", "investor"], clientGeneration: false },
  { slug: "investor-reporting-policy", label: "Investor Reporting Policy", audiences: ["admin", "investor"], clientGeneration: false },
  { slug: "investor-governance-charter", label: "Investor Governance Charter", audiences: ["admin", "investor"], clientGeneration: false },
  { slug: "family-investment-overview", label: "Family Investment Overview", audiences: ["admin", "investor"], clientGeneration: false },
];

function audienceForRole(role: UserRole | null | undefined): DocumentTemplateAudience {
  if (role === "investor") return "investor";
  if (role === "employee") return "employee";
  return "admin";
}

export function getDocumentTemplatesForRole(role: UserRole | null | undefined): DocumentTemplateDefinition[] {
  const audience = audienceForRole(role);
  return DOCUMENT_TEMPLATES.filter((t) => t.audiences.includes(audience));
}

export function getDocumentLibraryCountForRole(role: UserRole | null | undefined): number {
  return getDocumentTemplatesForRole(role).length;
}

export function getClientGenerationTemplates(): DocumentTemplateDefinition[] {
  return DOCUMENT_TEMPLATES.filter((t) => t.clientGeneration);
}

export function getClientGenerationTemplateSlugs(): string[] {
  return getClientGenerationTemplates().map((t) => t.slug);
}

export function getTemplateLabelMap(): Record<string, string> {
  return Object.fromEntries(DOCUMENT_TEMPLATES.map((t) => [t.slug, t.label]));
}
