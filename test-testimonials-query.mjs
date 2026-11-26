import {createClient} from '@supabase/supabase-js';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
(async()=>{
  const {data,error}=await db.from('testimonials').select('*', { count: 'exact' }).eq('status', 'published').order('created_at', { ascending: false, nullsFirst: false }).limit(50);
  console.log('testimonials:',data,error);
})()