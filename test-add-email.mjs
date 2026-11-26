import {createClient} from '@supabase/supabase-js';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
(async()=>{
  const {data,error}=await db.rpc('exec_sql',{sql:'ALTER TABLE faculty ADD COLUMN IF NOT EXISTS email TEXT'});
  console.log('alter:',data,error);
})()