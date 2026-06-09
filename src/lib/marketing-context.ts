// Marketing context extracted from swiftdesignz.co.za — used by the AI marketing agent

export const BRAND = {
  name: "Swift Designz",
  legalName: "Swift Designz Investments CC",
  tagline: "Crafting Digital Excellence",
  email: "info@swiftdesignz.co.za",
  website: "swiftdesignz.co.za",
  location: "Windhoek, Namibia",
  markets: ["Namibia", "South Africa"],
  tone: "Bold, confident, clean. No fluff. Results-driven. Speaks to SMEs and entrepreneurs.",
};

export const SERVICES = [
  {
    name: "Web Development",
    id: "web_dev",
    description: "Custom-built websites tailored to your brand and business goals. Clean code, fast load times, mobile-first design, and SEO-ready from day one.",
    features: ["Custom Design", "Responsive", "SEO Optimised", "Fast Load Times", "CMS Integration"],
  },
  {
    name: "E-Commerce",
    id: "ecommerce",
    description: "Full-featured online stores that sell. Product catalogues, checkout flows, payment integration, and inventory management built to convert.",
    features: ["Product Catalogue", "Payment Integration", "Cart & Checkout", "Inventory Management", "Order Tracking"],
  },
  {
    name: "Apps & Software",
    id: "apps",
    description: "Mobile and web apps built from the ground up. From budgeting tools to job search platforms — we build software that solves real problems.",
    features: ["Mobile Apps", "Web Apps", "Cloud Infrastructure", "API Integration", "SaaS Platforms"],
  },
  {
    name: "Project Management Training",
    id: "pm_training",
    description: "Practical PM training for teams and individuals. Scrum, Agile, and traditional methodologies — taught by practitioners, not theorists.",
    features: ["Agile & Scrum", "Team Workshops", "Certification Prep", "Process Design", "Tool Training"],
  },
  {
    name: "AI Training",
    id: "ai_training",
    description: "Hands-on AI literacy and prompt engineering workshops for business owners and teams. Learn to work with AI tools, automate workflows, and stay ahead.",
    features: ["Prompt Engineering", "AI Tool Workshops", "Workflow Automation", "ChatGPT & Claude", "Business AI Strategy"],
  },
  {
    name: "Support & Retainers",
    id: "retainers",
    description: "Ongoing support, maintenance, and development retainers. We keep your digital products running, updated, and growing month after month.",
    features: ["Monthly Maintenance", "Bug Fixes", "Feature Updates", "Performance Monitoring", "Priority Support"],
  },
];

export const PORTFOLIO = [
  { title: "TB Free Foundation", category: "websites", url: "tb-free.org", description: "Health foundation website — clean, calm, professional aesthetic with custom typography." },
  { title: "DUNMORE Training & Skills Development", category: "websites", url: "dunmore.co.za", description: "SETA-accredited training provider — First Aid, Fire Fighting, Health & Safety across the Western Cape." },
  { title: "IA Academy", category: "websites", url: "ia-academy.org", description: "Neurodivergent-friendly Cambridge school in Windhoek. ADHD, ADD, Dyslexia support from Grade R to 12." },
  { title: "IT-Guru Online", category: "websites", description: "Cape Town IT support — hosting, domains, remote support, network solutions." },
  { title: "Rehoboth Community Trust", category: "websites", url: "rehotrust.netlify.app", description: "Namibian non-profit. Sustainable community development in Rehoboth since 2003." },
  { title: "Ruby's Faith Jewellery Store", category: "ecommerce", url: "rubysfaith.co.za", description: "Elegant jewellery brand store. Rich product catalogue with a design that reflects the brand." },
  { title: "Fryse — Freeze Dried Products", category: "ecommerce", url: "fryse.com.na", description: "Freeze-dried food company. Rich visuals, easy navigation, seamless shopping experience." },
  { title: "Essential 420 — Cannabis Dispensary", category: "ecommerce", description: "Luxury cannabis dispensary platform. Premium flowers, edibles, vapes, CBD wellness." },
  { title: "BasketBuddy — Budgeting App", category: "apps", description: "Budgeting app with expense tracking, financial goals, and elegant charts." },
  { title: "HireMeBuddy — Job Search App", category: "apps", description: "Job search app — advanced filters, resume management, real-time notifications." },
];

export const TESTIMONIALS = [
  { quote: "Yoh! the website is looking fire! That's mad and so convenient. Wow.", name: "Anonymous", role: "Client" },
  { quote: "I can only thank God for putting this young man on our path. He immediately understood the assignment. A huge thank you to Keenan and Ambrose for executing everything in excellence.", name: "Grateful Client", role: "Client" },
  { quote: "The banner, overall look and feel, font and clean flowing state of the site is STUNNING. User experience pleasant, calm and inviting. I love it.", name: "Satisfied Client", role: "Business Owner" },
  { quote: "From my experience working with many developers across various projects, you should be proud of yourself. You take ownership, and your work ethic truly stands out. Your work clearly reflects your passion, dedication, and skill.", name: "Ambrose Isaacs", role: "Project Manager" },
  { quote: "This is soooo beautiful. I am speechless. The colours, the feel — you got it all. You are truly blessed with a great gift.", name: "Ruth Gwasira", role: "Client — Ruby's Faith Jewellery" },
  { quote: "Ek kan nie glo dis my shop nie. Alles is baie smart. Dis 'n great shoppers website! Baie dankie vir die goeie navorsing. Ek is oorweldig!", name: "Yvonne Steenkamp", role: "Client — Fryse" },
];

export const MARKETING_ASSETS = [
  // Instagram
  { filename: "ig-01-bold-intro.png",       platform: "instagram", title: "Bold Brand Intro",            type: "image" },
  { filename: "ig-02-quote.png",             platform: "instagram", title: "Quote Card",                  type: "image" },
  { filename: "ig-03-brand-card.png",        platform: "instagram", title: "Brand Card",                  type: "image" },
  { filename: "ig-mar26-01-remote.png",      platform: "instagram", title: "Remote Work — Mar 26",        type: "image" },
  { filename: "ig-mar26-02-services.png",    platform: "instagram", title: "Services Overview — Mar 26",  type: "image" },
  { filename: "ig-mar26-03-web-ecom.png",    platform: "instagram", title: "Web & E-Commerce — Mar 26",   type: "image" },
  { filename: "ig-mar26-04-apps-train.png",  platform: "instagram", title: "Apps & Training — Mar 26",   type: "image" },
  // Facebook
  { filename: "fb-01-promo-banner.png",            platform: "facebook", title: "Promo Banner",              type: "image" },
  { filename: "fb-02-services-grid.png",           platform: "facebook", title: "Services Grid",             type: "image" },
  { filename: "fb-carousel-portfolio-01.png",      platform: "facebook", title: "Portfolio Carousel 1",      type: "image" },
  { filename: "fb-carousel-portfolio-02.png",      platform: "facebook", title: "Portfolio Carousel 2",      type: "image" },
  { filename: "fb-carousel-portfolio-03.png",      platform: "facebook", title: "Portfolio Carousel 3",      type: "image" },
  { filename: "fb-carousel-portfolio-04.png",      platform: "facebook", title: "Portfolio Carousel 4",      type: "image" },
  { filename: "fb-carousel-portfolio-05.png",      platform: "facebook", title: "Portfolio Carousel 5",      type: "image" },
  { filename: "fb-carousel-portfolio-06.png",      platform: "facebook", title: "Portfolio Carousel 6",      type: "image" },
  { filename: "fb-carousel-portfolio-07.png",      platform: "facebook", title: "Portfolio Carousel 7",      type: "image" },
  { filename: "fb-carousel-portfolio-08.png",      platform: "facebook", title: "Portfolio Carousel 8",      type: "image" },
  { filename: "fb-carousel-portfolio-09.png",      platform: "facebook", title: "Portfolio Carousel 9",      type: "image" },
  // General posts
  { filename: "01-launch-announcement.png", platform: "other",     title: "Launch Announcement",        type: "image" },
  { filename: "02-services.png",            platform: "other",     title: "Services Overview",          type: "image" },
  { filename: "03-pricing.png",             platform: "other",     title: "Pricing",                    type: "image" },
  { filename: "04-cta.png",                 platform: "other",     title: "Call To Action",             type: "image" },
  { filename: "05-about.png",               platform: "other",     title: "About Us",                   type: "image" },
  { filename: "06-process.png",             platform: "other",     title: "Our Process",                type: "image" },
  { filename: "07-link-in-bio.png",         platform: "other",     title: "Link In Bio",                type: "image" },
  // WhatsApp
  { filename: "wa-01-superpower.mp4",       platform: "other",     title: "WhatsApp — Superpower",      type: "video" },
  { filename: "wa-02-delivered.mp4",        platform: "other",     title: "WhatsApp — Delivered",       type: "video" },
  { filename: "wa-03-growth.mp4",           platform: "other",     title: "WhatsApp — Growth",          type: "video" },
  { filename: "wa-04-start-project.mp4",    platform: "other",     title: "WhatsApp — Start Project",   type: "video" },
  // Video reels
  { filename: "client-milestone-post.mp4",  platform: "instagram", title: "Client Milestone",           type: "video" },
  { filename: "immersive-post.mp4",         platform: "instagram", title: "Immersive Brand Reel",       type: "video" },
  { filename: "lets-build-post.mp4",        platform: "instagram", title: "Let's Build Reel",           type: "video" },
  { filename: "logo-showcase.mp4",          platform: "instagram", title: "Logo Showcase",              type: "video" },
  { filename: "mobile-post-1-services.mp4", platform: "instagram", title: "Services — Mobile Reel",     type: "video" },
  { filename: "mobile-post-2-pricing.mp4",  platform: "instagram", title: "Pricing — Mobile Reel",      type: "video" },
  { filename: "mobile-post3-cta.mp4",       platform: "instagram", title: "CTA — Mobile Reel",          type: "video" },
  { filename: "payment-plans-post.mp4",     platform: "instagram", title: "Payment Plans Reel",         type: "video" },
  { filename: "persuasion-post.mp4",        platform: "instagram", title: "Persuasion Reel",            type: "video" },
  { filename: "post-3-logo-showcase.mp4",   platform: "instagram", title: "Logo Showcase v2",           type: "video" },
  { filename: "post-slogan-strive.mp4",     platform: "instagram", title: "Slogan — Strive",            type: "video" },
  { filename: "story-who-we-are.mp4",       platform: "instagram", title: "Story — Who We Are",         type: "video" },
  { filename: "swift-designz-sfx.mp4",      platform: "instagram", title: "Brand SFX Reel",             type: "video" },
  { filename: "websites-post.mp4",          platform: "instagram", title: "Websites Showcase Reel",     type: "video" },
  // Fundraise
  { filename: "fundraise-1a-who-is-keenan.mp4", platform: "other", title: "Fundraise — Who Is Keenan", type: "video" },
  { filename: "fundraise-1a-who-is-keenan.png", platform: "other", title: "Fundraise — Who Is Keenan", type: "image" },
  { filename: "fundraise-1b-the-raise.png",     platform: "other", title: "Fundraise — The Raise",     type: "image" },
  // Print
  { filename: "Print_Transparent.svg",      platform: "other",     title: "Print — Transparent Logo",  type: "image" },
];

export const ASSET_BASE_URL = "/marketing";

export function buildSystemPrompt(): string {
  const serviceList = SERVICES.map((s) => `- ${s.name}: ${s.description}`).join("\n");
  const portfolioList = PORTFOLIO.map((p) => `- ${p.title} (${p.category}): ${p.description}`).join("\n");
  const testimonialList = TESTIMONIALS.map((t) => `- "${t.quote}" — ${t.name}, ${t.role}`).join("\n");

  return `You are the marketing AI agent for ${BRAND.name} (${BRAND.legalName}).
Tagline: "${BRAND.tagline}"
Location: ${BRAND.location}. Markets: ${BRAND.markets.join(", ")}.
Brand tone: ${BRAND.tone}

SERVICES:
${serviceList}

PORTFOLIO HIGHLIGHTS:
${portfolioList}

CLIENT TESTIMONIALS:
${testimonialList}

GUIDELINES:
- Write in a bold, clean, no-fluff voice. No hollow buzzwords.
- Call to action should feel urgent but not pushy.
- Hashtags: mix broad (#webdesign) with niche (#namibiawebdesign, #windhoekbusiness).
- Keep Instagram captions under 150 words. Facebook can be slightly longer.
- Always end captions with a clear CTA (DM, link in bio, swipe, comment, etc.).
- Never invent fake stats or prices. Keep it authentic.
- Speak to SMEs, entrepreneurs, and business owners in Southern Africa.`;
}
