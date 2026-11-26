import {createClient} from '@supabase/supabase-js';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
(async()=>{
  const {data,error}=await db.from('staff_sessions').insert({token_hash:'test',expires_at:new Date(Date.now()+86400000).toISOString()}).select();
  console.log('error:',error);
  console.log('data:',data);
})()