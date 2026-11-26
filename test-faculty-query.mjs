import {createClient} from '@supabase/supabase-js';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
(async()=>{
  const start = Date.now();
  try {
    const {data,error}=await db.from('faculty').select('*').eq('status','published').order('sort_order', { ascending: true }).order('id', { ascending: true });
    console.log('Time:', Date.now() - start, 'ms');
    console.log('faculty:',data,error);
  } catch (error) {
    console.error('Error:', error);
  }
})()