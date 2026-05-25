export interface ServiceItem {
  title: string;
  description: string;
}

export interface ServiceLevel {
  priority: string;
  issueType: string;
  response: string;
  resolution: string;
}

export interface PaymentTermRow {
  item: string;
  detail: string;
}

export interface RetainerClient {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
}

export interface RetainerContent {
  // PDF header
  documentTitle: string;
  documentSubtitle: string;

  // Client (selected from portal)
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientCompany?: string;

  // Document meta
  ref: string;
  effectiveDate: string;

  // Provider
  providerName: string;
  providerTitle: string;
  providerEmail: string;
  providerPhone: string;
  providerWebsite: string;

  // Intro
  introText: string;

  // Section 01
  monthlyRate: string;
  includedServices: ServiceItem[];

  // Section 02
  excludedServices: ServiceItem[];

  // Section 03
  gatewayTerms: string[];

  // Section 04
  serviceLevels: ServiceLevel[];

  // Section 05
  paymentTerms: PaymentTermRow[];

  // Section 06
  durationTerms: string[];

  // Section 07
  cancellationTerms: string[];

  // Section 08
  upgradeTerms: string[];

  // Section 09
  clientResponsibilities: string[];

  // Section 10
  ipTerms: string[];

  // Section 11
  liabilityTerms: string[];

  // Section 12
  generalTerms: string[];

  // Closing
  closingStatement: string;
}

/** DB row shape returned from the retainers table */
export interface RetainerRecord {
  id: string;
  name: string;
  content: RetainerContent;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const SHARED_LEGAL: Pick<RetainerContent,
  "durationTerms" | "cancellationTerms" | "upgradeTerms" |
  "ipTerms" | "liabilityTerms" | "generalTerms" | "closingStatement"
> = {
  durationTerms: [
    "This Agreement is valid for an initial fixed term of 12 (twelve) calendar months from the date of signing.",
    "Upon expiry, the Agreement automatically renews on a rolling monthly basis under the same terms, unless either party provides 30 days' written notice of cancellation per Section 07.",
    "Swift Designz may review the retainer rate at any renewal point with at least 30 days' written notice before the change takes effect.",
    "The Client may accept the revised rate or cancel per Section 07.",
  ],
  cancellationTerms: [
    "Either party may cancel by providing 30 (thirty) days' written notice via email to keenan@swiftdesignz.co.za.",
    "The retainer remains active and payable throughout the 30-day notice period. No partial-month refunds are issued.",
    "Clients who exit before the end of the initial 12-month fixed term will lose retainer pricing. All future services will default to separately scoped quotations at standard rates.",
    "Swift Designz may terminate immediately in cases of: non-payment beyond 14 calendar days, abusive conduct, or material breach of these terms.",
    "Upon termination, all assets and store credentials will be returned to the Client within 5 business days.",
  ],
  upgradeTerms: [
    "The Client may request an upgrade at any time to include additional services.",
    "Upgrades are subject to availability and will be quoted in writing before taking effect.",
    "An upgraded retainer results in a revised monthly rate, agreed in writing before activation.",
    "Out-of-scope requests not covered by an upgrade will be quoted separately as once-off services.",
  ],
  ipTerms: [
    "All work produced under this retainer becomes the property of the Client upon full payment of the applicable monthly invoice.",
    "Swift Designz retains the right to display retainer work in its portfolio unless the Client opts out in writing.",
    "The Client's brand assets, products, and data remain exclusively the property of the Client at all times.",
  ],
  liabilityTerms: [
    "Swift Designz is not liable for losses arising from platform outages, third-party app failures, or events outside its direct control.",
    "Swift Designz is not responsible for changes made by the Client or any third party outside this Agreement.",
    "Total liability shall not exceed the total retainer fees paid in the 3 months preceding the event giving rise to the claim.",
    "Swift Designz does not guarantee specific sales outcomes, conversion rates, or revenue results.",
  ],
  generalTerms: [
    "This Agreement is governed by the laws of the Republic of South Africa.",
    "This Agreement supersedes any prior verbal or written discussions on this subject.",
    "Amendments must be made in writing and signed by both parties.",
    "This Agreement is subject to Swift Designz Terms & Conditions (SD-TC-2026), incorporated by reference.",
  ],
  closingStatement:
    "By signing below, both parties confirm they have read and agree to the terms of this Retainer Agreement. This Agreement is binding from the date of the last signature. The 12-month term commences on the date of signing.",
};

const SHARED_PROVIDER: Pick<RetainerContent,
  "providerName" | "providerTitle" | "providerEmail" | "providerPhone" | "providerWebsite"
> = {
  providerName: "Keenan Husselmann",
  providerTitle: "Trading as Swift Designz",
  providerEmail: "keenan@swiftdesignz.co.za",
  providerPhone: "+264 81 853 6789",
  providerWebsite: "swiftdesignz.co.za",
};

/** Blank template — start a new retainer from scratch */
export const BLANK_RETAINER: RetainerContent = {
  documentTitle: "",
  documentSubtitle: "",
  ref: "SD-RET-2026",
  effectiveDate: "2026",
  ...SHARED_PROVIDER,
  introText:
    "This Agreement governs the ongoing services provided by Swift Designz to the Client. By signing, both parties agree to the terms herein. Subject to Swift Designz Terms & Conditions (SD-TC-2026).",
  monthlyRate: "R0",
  includedServices: [],
  excludedServices: [],
  gatewayTerms: [],
  serviceLevels: [
    { priority: "Critical", issueType: "", response: "Within 4 hours", resolution: "Same day" },
    { priority: "High", issueType: "", response: "Within 8 hours", resolution: "1 business day" },
    { priority: "Normal", issueType: "", response: "Within 24 hours", resolution: "2–3 business days" },
    { priority: "Low", issueType: "", response: "2 business days", resolution: "By agreement" },
  ],
  paymentTerms: [
    { item: "Monthly Rate", detail: "" },
    { item: "Due Date", detail: "Client's choice: 1st or last calendar day of the month (confirmed at sign-up)" },
    { item: "Payment Method", detail: "EFT only. Reference must include the invoice number." },
    { item: "Grace Period", detail: "3 calendar days from the due date" },
    { item: "Late Payment", detail: "Services paused after 3 days. Resumes on receipt of outstanding amount." },
    { item: "VAT", detail: "Swift Designz is not VAT registered. No VAT is charged." },
  ],
  clientResponsibilities: [
    "Provide timely access to required platforms, credentials, and third-party tools.",
    "Ensure accuracy of all content, assets, and information supplied.",
    "Respond to queries or approval requests within 3 business days.",
  ],
  ...SHARED_LEGAL,
};

/** eStore Retainer — pre-filled content for convenience */
export const ESTORE_RETAINER_TEMPLATE: RetainerContent = {
  documentTitle: "eStore Retainer Agreement",
  documentSubtitle: "Monthly eCommerce Management Contract",
  ref: "SD-ESR-2026",
  effectiveDate: "May 2026",
  ...SHARED_PROVIDER,
  introText:
    "This Agreement governs the ongoing management and support of the Client's eCommerce store at R1,200/month. By signing, both parties agree to the terms herein. Subject to Swift Designz Terms & Conditions (SD-TC-2026).",
  monthlyRate: "R1,200",
  includedServices: [
    { title: "Product Management", description: "Adding, editing, and removing products including descriptions, pricing, variants, and collections." },
    { title: "Image Generation", description: "Creation and optimisation of product and banner images for the store." },
    { title: "Automation", description: "Setting up and maintaining store automations, flows, and triggers to streamline operations." },
    { title: "Theme Editing", description: "Visual and layout adjustments including colour, typography, section layout, and responsiveness." },
    { title: "24-Hour Maintenance & Support", description: "Monitoring for issues and downtime with rapid response within 24 hours." },
    { title: "Training", description: "Guidance and training to help the Client or their team manage the store effectively." },
  ],
  excludedServices: [
    { title: "Inventory Management", description: "Stock control, supplier coordination, and purchase order management." },
    { title: "Cost Management", description: "Margin analysis, cost-of-goods tracking, and pricing strategy." },
    { title: "Payment Gateway Integration", description: "Governed separately under Section 03." },
    { title: "Product Research", description: "Market research, competitor analysis, and new product identification." },
    { title: "Advertising", description: "Paid media campaigns (Google, Meta, TikTok), ad creative, and budget management." },
    { title: "Social Media Promotion", description: "Content creation, scheduling, community management, and organic growth." },
  ],
  gatewayTerms: [
    "Integration is a once-off project, scoped and quoted separately from this retainer.",
    "A separate invoice will be issued for the once-off setup fee prior to commencement.",
    "Following integration, the monthly retainer will increase to cover ongoing gateway management. The revised rate is agreed in writing before integration begins.",
    "Swift Designz is not liable for gateway outages, fee changes, or third-party compliance requirements (e.g. PCI-DSS).",
  ],
  serviceLevels: [
    { priority: "Critical", issueType: "Store down, checkout broken, payment failure", response: "Within 4 hours", resolution: "Same day" },
    { priority: "High", issueType: "Product errors, major display issues", response: "Within 8 hours", resolution: "1 business day" },
    { priority: "Normal", issueType: "Content updates, automation, theme edits", response: "Within 24 hours", resolution: "2–3 business days" },
    { priority: "Low", issueType: "Training requests, feature suggestions", response: "2 business days", resolution: "By agreement" },
  ],
  paymentTerms: [
    { item: "Monthly Rate", detail: "R1,200 per calendar month" },
    { item: "Due Date", detail: "Client's choice: 1st or last calendar day of the month (confirmed at sign-up)" },
    { item: "Payment Method", detail: "EFT only. Reference must include the invoice number." },
    { item: "Grace Period", detail: "3 calendar days from the due date" },
    { item: "Late Payment", detail: "Services paused after 3 days. Resumes on receipt of outstanding amount." },
    { item: "VAT", detail: "Swift Designz is not VAT registered. No VAT is charged." },
  ],
  clientResponsibilities: [
    "Provide timely access to the store backend, credentials, and required third-party tools.",
    "Ensure accuracy of all product information, pricing, and content supplied.",
    "Notify Swift Designz of planned promotions or high-traffic events at least 5 business days in advance.",
    "All third-party subscription costs (Shopify plan fees, app subscriptions, theme licences) are the Client's responsibility.",
    "Respond to queries or approval requests within 3 business days. Delays caused by unresponsiveness are excluded from SLA targets.",
  ],
  ...SHARED_LEGAL,
};

// Keep alias for the old static estore-retainer template (used by document-content-registry)
export type EstoreRetainerContent = RetainerContent;
export const DEFAULT_ESTORE_RETAINER: RetainerContent = ESTORE_RETAINER_TEMPLATE;
