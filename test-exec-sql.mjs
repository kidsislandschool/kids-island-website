import {createClient} from '@supabase/supabase-js';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
(async()=>{
  const {data,error}=await db.from('information_schema.routines').select('routine_name').eq('routine_name','exec_sql');
  console.log('exec_sql function:',data,error);
})()