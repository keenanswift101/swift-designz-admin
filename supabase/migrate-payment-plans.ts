const url = "https://nxuvzdrqgrmureejigpf.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function runSQL(sql: string) {
  const _res = await fetch(`${url}/rest/v1/rpc/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({}),
  });
  // REST doesn't support DDL; use the management API via pg
  // Let's use the SQL editor endpoint instead
  const pgRes = await fetch(`${url}/pg/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  return pgRes;
}

async function migrate() {
  const sql = `
    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_plan_type text;
    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_plan_schedule jsonb;
  `;
  const res = await runSQL(sql);
  console.log("Status:", res.status);
  const body = await res.text();
  console.log("Response:", body);
}

migrate();
