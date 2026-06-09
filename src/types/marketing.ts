export type CampaignChannel = "social_media" | "email" | "google_ads" | "print" | "events" | "other";
export type CampaignStatus = "draft" | "active" | "paused" | "completed";
export type CampaignGoal = "brand_awareness" | "lead_gen" | "conversion" | "retention";

export type ContentPlatform = "instagram" | "facebook" | "twitter" | "linkedin" | "tiktok" | "blog" | "other";
export type ContentStatus = "draft" | "scheduled" | "published" | "cancelled";

export type EmailRecipientType = "all_clients" | "all_leads" | "custom";
export type EmailCampaignStatus = "draft" | "sent";

export interface MarketingCampaign {
  id: string;
  name: string;
  description: string | null;
  channel: CampaignChannel;
  status: CampaignStatus;
  budget_cents: number;
  spent_cents: number;
  start_date: string | null;
  end_date: string | null;
  goal: CampaignGoal | null;
  target_audience: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentPost {
  id: string;
  campaign_id: string | null;
  title: string;
  content: string | null;
  platform: ContentPlatform;
  status: ContentStatus;
  scheduled_at: string | null;
  published_at: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaign {
  id: string;
  campaign_id: string | null;
  name: string;
  subject: string;
  body_html: string;
  body_text: string;
  status: EmailCampaignStatus;
  recipient_type: EmailRecipientType;
  custom_recipients: string[];
  recipient_count: number;
  sent_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const CHANNEL_LABELS: Record<CampaignChannel, string> = {
  social_media: "Social Media",
  email: "Email",
  google_ads: "Google Ads",
  print: "Print",
  events: "Events",
  other: "Other",
};

export const GOAL_LABELS: Record<CampaignGoal, string> = {
  brand_awareness: "Brand Awareness",
  lead_gen: "Lead Generation",
  conversion: "Conversion",
  retention: "Retention",
};

export const PLATFORM_LABELS: Record<ContentPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "Twitter / X",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  blog: "Blog",
  other: "Other",
};

export const PLATFORM_COLORS: Record<ContentPlatform, string> = {
  instagram: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  facebook:  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  twitter:   "bg-sky-500/20 text-sky-400 border-sky-500/30",
  linkedin:  "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  tiktok:    "bg-purple-500/20 text-purple-400 border-purple-500/30",
  blog:      "bg-amber-500/20 text-amber-400 border-amber-500/30",
  other:     "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export const CAMPAIGN_STATUS_STYLES: Record<CampaignStatus, string> = {
  draft:     "bg-gray-500/10 text-gray-400 border-gray-500/20",
  active:    "bg-green-500/10 text-green-400 border-green-500/20",
  paused:    "bg-amber-500/10 text-amber-400 border-amber-500/20",
  completed: "bg-teal/10 text-teal border-teal/20",
};
