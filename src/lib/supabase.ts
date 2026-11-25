import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseInstance: ReturnType<typeof createClient> | null = null;
let supabaseAdminInstance: ReturnType<typeof createClient> | null = null;

function makeMockClient() {
  const chain = {
    select: () => chain,
    eq: () => chain,
    neq: () => chain,
    gt: () => chain,
    gte: () => chain,
    lt: () => chain,
    lte: () => chain,
    like: () => chain,
    ilike: () => chain,
    is: () => chain,
    in: () => chain,
    order: () => chain,
    limit: () => chain,
    range: () => chain,
    single: () => Promise.resolve({ data: null, error: null }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
  };
  
  const mockClient = {
    from: () => chain,
    rpc: () => Promise.resolve({ data: null, error: null }),
  };
  
  // Make chain.then work so it can be awaited
  Object.defineProperty(chain, 'then', {
    value: (onFulfilled: any) => Promise.resolve([]).then(onFulfilled),
    enumerable: false,
    writable: true,
    configurable: true
  });
  
  // Also make it work with Promise.resolve(chain)
  Object.defineProperty(chain, Symbol.iterator, {
    value: () => [][Symbol.iterator](),
    enumerable: false,
    writable: true,
    configurable: true
  });
  
  return mockClient;
}

function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function getSupabase() {
  if (!supabaseUrl || !supabaseAnonKey || !isValidHttpUrl(supabaseUrl)) {
    return makeMockClient();
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });
  }
  return supabaseInstance;
}

function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey || !isValidHttpUrl(supabaseUrl)) {
    return makeMockClient();
  }
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });
  }
  return supabaseAdminInstance;
}

export const supabase = getSupabase();
export const supabaseAdmin = getSupabaseAdmin();
export { createClient } from '@supabase/supabase-js';
export type { Session } from '@supabase/supabase-js';