import {createClient} from '@supabase/supabase-js';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
(async()=>{
  const {data,error}=await db.rpc('exec_sql',{sql:"SELECT * FROM inquiries WHERE status = $1 ORDER BY created_at DESC LIMIT 5", args:['new']});
  console.log('exec_sql inquiries:',data,error);
})()