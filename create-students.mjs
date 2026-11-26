import {createClient} from '@supabase/supabase-js';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
(async()=>{
  const {data,error}=await db.rpc('exec_sql',{sql:`CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    admission_number TEXT UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    class TEXT,
    section TEXT,
    date_of_birth DATE,
    gender TEXT,
    father_name TEXT,
    mother_name TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    admission_date DATE,
    status TEXT DEFAULT 'active',
    photo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`});
  console.log('create students:',data,error);
})()