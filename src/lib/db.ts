import { supabaseAdmin, supabase } from './supabase';

/**
 * Async database interface for Supabase
 * Provides async API that mimics the old synchronous better-sqlite3 API
 */

// Helper function to execute SQL via the exec_sql function
// Converts SQLite-style ? placeholders to PostgreSQL $1, $2, etc.
function convertPlaceholders(sql: string): string {
  let index = 0;
  return sql.replace(/\?/g, () => {
    index++;
    return `$${index}`;
  });
}

async function execSQL(sql: string, args: any[] = []) {
  const pgSql = convertPlaceholders(sql);
  const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql: pgSql, args });
  if (error) throw error;
  return data || [];
}

/**
 * Async database interface that mimics the old synchronous API
 * All methods return Promises
 */
export class SupabaseDB {
  /**
   * Execute raw SQL
   */
  static async exec(sql: string): Promise<void> {
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql });
    if (error) throw error;
  }

  /**
   * Prepare a statement - returns an object with get, all, run methods
   */
  static prepare(sql: string) {
    return {
      async get(...params: any[]): Promise<any> {
        const result = await execSQL(sql, params);
        return result?.[0] || null;
      },

      async all(...params: any[]): Promise<any[]> {
        return execSQL(sql, params);
      },

      async run(...params: any[]): Promise<{ changes: number; lastInsertRowid: number }> {
        const result = await execSQL(sql, params);
        return {
          changes: result?.length || 0,
          lastInsertRowid: Number(result?.[0]?.id || 0),
        };
      },
    };
  }

  static async transaction<T>(fn: () => Promise<T>): Promise<T> {
    // Supabase doesn't have explicit transactions in the same way
    // We'll run the function directly
    return fn();
  }

  static from(table: string) {
    return supabaseAdmin.from(table);
  }

  static fromPublic(table: string) {
    return supabase.from(table);
  }

  static pragma(key: string, value?: any): any {
    if (key === 'user_version') return 0;
    if (key === 'foreign_keys = ON') return;
    if (key === 'journal_mode = WAL') return;
    if (key === 'busy_timeout = 5000') return;
    return undefined;
  }

  static close(): void {}
}

// Backward compatibility function
export function getDb() {
  return SupabaseDB;
}

// Re-export supabase clients
export { supabase, supabaseAdmin } from './supabase';

// Type exports
export type { Session } from '@supabase/supabase-js';

// Export the class for direct usage (already exported at class declaration)