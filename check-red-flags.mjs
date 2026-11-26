import {createClient} from '@supabase/supabase-js';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
(async()=>{
  const {data,error}=await db.from('information_schema.columns').select('column_name').eq('table_name','red_flags');
  console.log('red_flags columns:',data,error);
})()