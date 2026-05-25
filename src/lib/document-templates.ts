import type { UserRole } from "@/types/database";

export type DocumentTemplateAudience = "admin" | "investor";

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
  { slug: "investor-nda", label: "Investor NDA", audiences: ["admin", "investor"], clientGeneration: false },
  { slug: "investor-terms-and-conditions", label: "Investor Terms and Conditions", audiences: ["admin", "investor"], clientGeneration: false },
  { slug: "investor-reporting-policy", label: "Investor Reporting Policy", audiences: ["admin", "investor"], clientGeneration: false },
  { slug: "investor-governance-charter", label: "Investor Governance Charter", audiences: ["admin", "investor"], clientGeneration: false },
  { slug: "family-investment-overview", label: "Family Investment Overview", audiences: ["admin", "investor"], clientGeneration: false },
];

function audienceForRole(role: UserRole | null | undefined): DocumentTemplateAudience {
  return role === "investor" ? "investor" : "admin";
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
