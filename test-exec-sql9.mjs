import {createClient} from '@supabase/supabase-js';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
(async()=>{
  const {data,error}=await db.rpc('exec_sql',{sql:'SELECT * FROM notices WHERE status = \'published\' ORDER BY pinned DESC, COALESCE(published_at, created_at) DESC LIMIT 9'});
  console.log('exec_sql notices:',data,error);
})()