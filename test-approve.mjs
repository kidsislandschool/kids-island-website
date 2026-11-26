import {createClient} from '@supabase/supabase-js';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
(async()=>{
  const {data,error}=await db.from('staff').update({status:'approved',approved_at:new Date().toISOString()}).eq('id',8).select();
  console.log('updated:',data,error);
})()