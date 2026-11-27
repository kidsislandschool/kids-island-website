const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function call(fn, args) {
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  const text = await res.text();
  console.log(fn, args, "=>", res.status, text.slice(0, 500));
}

await call("exec_sql", { sql: "select 1 as ok" });
await call("exec_sql", { query: "select 1 as ok" });
await call("execute_sql", { sql: "select 1 as ok" });
