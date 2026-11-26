import {createClient} from '@supabase/supabase-js';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
(async()=>{
  const {data,error}=await db.from('inquiries').select('*').limit(1);
  console.log('inquiries:',data,error);
  const {data:d2,error:e2}=await db.from('notices').select('*').limit(1);
  console.log('notices:',d2,e2);
  const {data:d3,error:e3}=await db.from('faculty').select('*').limit(1);
  console.log('faculty:',d3,e3);
})()