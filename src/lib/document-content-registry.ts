import type { TemplateDocument } from "@/components/documents/pdf-styles";
import {
  termsAndConditions,
  nda,
  clientOnboarding,
  changeRequestForm,
  proceedToBuild,
  maintenanceRetainer,
  paymentPlanAgreement,
  projectHandover,
  estoreRetainer,
} from "./document-content-client";
import {
  investorTermsAndConditions,
  investorNda,
  investorReportingPolicy,
  investorGovernanceCharter,
  familyInvestmentOverview,
} from "./document-content-investor";

/**
 * Maps document slugs (from DOCUMENT_TEMPLATES) to their PDF content definitions.
 * Excludes quote-template and invoice-template which use InvoicePDF instead.
 */
const DOCUMENT_CONTENT_REGISTRY: Record<string, TemplateDocument> = {
  "terms-and-conditions": termsAndConditions,
  nda: nda,
  "client-onboarding": clientOnboarding,
  "change-request-form": changeRequestForm,
  "proceed-to-build": proceedToBuild,
  "maintenance-retainer": maintenanceRetainer,
  "payment-plan-agreement": paymentPlanAgreement,
  "project-handover": projectHandover,
  "estore-retainer": estoreRetainer,
  "investor-terms-and-conditions": investorTermsAndConditions,
  "investor-nda": investorNda,
  "investor-reporting-policy": investorReportingPolicy,
  "investor-governance-charter": investorGovernanceCharter,
  "family-investment-overview": familyInvestmentOverview,
};

export function getTemplateContent(slug: string): TemplateDocument | null {
  return DOCUMENT_CONTENT_REGISTRY[slug] ?? null;
}

export function hasTemplateContent(slug: string): boolean {
  return slug in DOCUMENT_CONTENT_REGISTRY;
}
