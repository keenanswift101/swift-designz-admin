import { requireAuth } from "@/lib/auth";
import PageHeader from "@/components/ui/PageHeader";
import MarketingAgent from "@/components/marketing/MarketingAgent";

export default async function MarketingAgentPage() {
  await requireAuth();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketing Agent"
        description="AI-powered copy generation — captions, campaigns, email copy, hashtags"
      />
      <MarketingAgent />
    </div>
  );
}
