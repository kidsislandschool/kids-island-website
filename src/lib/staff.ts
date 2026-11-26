import { supabaseAdmin } from './supabase';

export type StaffRow = {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  designation: string | null;
  qualification: string | null;
  bio: string | null;
  photo: string | null;
  status: "pending" | "approved" | "rejected";
  password_hash: string;
  created_at: string;
  updated_at: string;
  approved_by: number | null;
  approved_at: string | null;
  auth_user_id: number | null;
};

export async function createStaff(input: {
  email: string;
  name: string;
  phone?: string;
  designation?: string;
  qualification?: string;
  bio?: string;
  password_hash: string;
}): Promise<{ id: number }> {
  const { data, error } = await supabaseAdmin
    .from('staff')
    .insert({
      email: input.email.toLowerCase(),
      name: input.name,
      phone: input.phone ?? null,
      designation: input.designation ?? null,
      qualification: input.qualification ?? null,
      bio: input.bio ?? null,
      password_hash: input.password_hash,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error) throw error;
  return { id: data.id };
}

export async function getStaffByEmail(email: string): Promise<StaffRow | undefined> {
  const { data, error } = await supabaseAdmin
    .from('staff')
    .select('*')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (error) throw error;
  return data as StaffRow | undefined;
}

export async function getStaffById(id: number): Promise<StaffRow | undefined> {
  const { data, error } = await supabaseAdmin
    .from('staff')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as StaffRow | undefined;
}

export async function listStaff(opts: { status?: string; search?: string } = {}): Promise<StaffRow[]> {
  let query = supabaseAdmin.from('staff').select('*');

  if (opts.status) {
    query = query.eq('status', opts.status);
  }
  if (opts.search) {
    const term = `%${opts.search}%`;
    query = query.or(`name.ilike.${term},email.ilike.${term},designation.ilike.${term}`);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as StaffRow[];
}

export async function updateStaffStatus(id: number, status: "approved" | "rejected", adminId: number): Promise<void> {
  const { error } = await supabaseAdmin
    .from('staff')
    .update({
      status,
      approved_by: adminId,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

export async function updateStaffProfile(id: number, data: Partial<StaffRow>): Promise<void> {
  const allowedFields = [
    'name', 'phone', 'designation', 'qualification', 'bio', 'photo', 'status'
  ];
  
  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  
  for (const [key, value] of Object.entries(data)) {
    if (allowedFields.includes(key)) {
      updates[key] = value;
    }
  }

  const { error } = await supabaseAdmin
    .from('staff')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export async function countStaffByStatus(): Promise<{ status: string; c: number }[]> {
  const { data, error } = await supabaseAdmin
    .from('staff')
    .select('status', { count: 'exact', head: true });

  if (error) throw error;

  // Get counts for each status
  const [{ count: pending }, { count: approved }, { count: rejected }] = await Promise.all([
    supabaseAdmin.from('staff').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('staff').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabaseAdmin.from('staff').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
  ]);

  return [
    { status: 'pending', c: pending ?? 0 },
    { status: 'approved', c: approved ?? 0 },
    { status: 'rejected', c: rejected ?? 0 },
  ];
}