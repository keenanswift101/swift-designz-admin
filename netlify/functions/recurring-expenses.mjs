/**
 * Netlify scheduled function — runs daily at 06:00 UTC (08:00 SAST).
 * Calls the recurring-expenses cron route to insert due monthly expenses.
 */
const handler = async () => {
  const baseUrl = process.env.URL || process.env.NEXT_PUBLIC_APP_URL;
  const secret = process.env.CRON_SECRET;

  if (!baseUrl || !secret) {
    console.error("Missing URL or CRON_SECRET env vars");
    return;
  }

  const res = await fetch(`${baseUrl}/api/cron/recurring-expenses`, {
    headers: { "x-cron-secret": secret },
  });

  const body = await res.json();
  console.log("recurring-expenses cron:", JSON.stringify(body));
};

export default handler;

export const config = {
  schedule: "0 6 * * *", // daily 06:00 UTC = 08:00 SAST
};
