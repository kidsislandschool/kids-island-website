import { supabaseAdmin, supabase } from './supabase';

export interface QueryResult {
  rows: any[];
  rowCount: number;
}

export interface RunResult {
  changes: number;
  lastInsertRowid: number | bigint;
}

/**
 * Supabase-compatible database interface
 * Provides async equivalents of better-sqlite3 methods
 */
export class SupabaseDB {
  /**
   * Execute raw SQL (for migrations, etc.)
   */
  async exec(sql: string): Promise<void> {
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql });
    if (error) throw error;
  }

  /**
   * Prepare a statement (mimics better-sqlite3 prepare)
   */
  prepare(sql: string) {
    const self = this;
    return {
      async get(...params: any[]): Promise<any> {
        const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql, args: params });
        if (error) throw error;
        return data?.[0] || null;
      },

      async all(...params: any[]): Promise<any[]> {
        const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql, args: params });
        if (error) throw error;
        return data || [];
      },

      async run(...params: any[]): Promise<{ changes: number; lastInsertRowid: number }> {
        const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql, args: params });
        if (error) throw error;
        return {
          changes: data?.length || 0,
          lastInsertRowid: Number(data?.[0]?.id || 0),
        };
      },
    };
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    return fn();
  }

  from(table: string) {
    return supabaseAdmin.from(table);
  }

  fromPublic(table: string) {
    return supabase.from(table);
  }

  pragma(key: string, value?: any): any {
    if (key === 'user_version') return 0;
    if (key === 'foreign_keys = ON') return;
    if (key === 'journal_mode = WAL') return;
    if (key === 'busy_timeout = 5000') return;
    return undefined;
  }

  close(): void {}
}

export const db = new SupabaseDB();

export type { QueryResult, RunResult };