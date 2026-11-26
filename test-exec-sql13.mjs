import {createClient} from '@supabase/supabase-js';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
(async()=>{
  const {data,error}=await db.rpc('exec_sql',{sql:'SELECT * FROM faqs WHERE status = \'published\' ORDER BY order_index ASC, id ASC LIMIT 50'});
  console.log('exec_sql faqs:',data,error);
})()