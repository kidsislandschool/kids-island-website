import { supabaseAdmin, supabase } from './supabase';

/**
 * Async database interface for Supabase
 * Provides async API that mimics the old synchronous better-sqlite3 API
 * but uses Supabase client directly instead of exec_sql RPC
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

/**
 * New database interface using Supabase client directly
 * This avoids the exec_sql RPC parameter binding issues
 */
export class SupabaseDirectDB {
  static from(table: string) {
    return supabaseAdmin.from(table);
  }

  static fromPublic(table: string) {
    return supabase.from(table);
  }

  static async exec(sql: string): Promise<void> {
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql });
    if (error) throw error;
  }

  static async query(sql: string, args: any[] = []) {
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { 
      sql: sql.replace(/\?/g, () => {
        let index = 0;
        return `$${++index}`;
      }), 
      args 
    });
    if (error) throw error;
    return data || [];
  }

  // Direct Supabase methods for common operations
  static async select(table: string, columns: string = '*', filters: Record<string, any> = {}) {
    let query = supabaseAdmin.from(table).select(columns);
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async selectOne(table: string, columns: string = '*', filters: Record<string, any> = {}) {
    let query = supabaseAdmin.from(table).select(columns);
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data;
  }

  static async insert(table: string, insertData: Record<string, any>) {
    const { data, error } = await supabaseAdmin.from(table).insert(insertData).select().single();
    if (error) throw error;
    return data;
  }

  static async update(table: string, updateData: Record<string, any>, filters: Record<string, any>) {
    let query = supabaseAdmin.from(table).update(updateData);
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
    const { data, error } = await query.select().single();
    if (error) throw error;
    return data;
  }

  static async delete(table: string, filters: Record<string, any>) {
    let query = supabaseAdmin.from(table).delete();
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
    const { error } = await query;
    if (error) throw error;
  }

  static async count(table: string, filters: Record<string, any> = {}) {
    let query = supabaseAdmin.from(table).select('*', { count: 'exact', head: true });
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }
}

// Backward compatibility function
export function getDb() {
  return SupabaseDB;
}

// New function to get direct Supabase client
export function getDirectDb() {
  return SupabaseDirectDB;
}

// Re-export supabase clients
export { supabase, supabaseAdmin } from './supabase';

// Type exports
export type { Session } from '@supabase/supabase-js';

// Export the class for direct usage (already exported at class declaration)