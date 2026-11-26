import {createClient} from '@supabase/supabase-js';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
(async()=>{
  const {data,error}=await db.from('staff').select('*').limit(5);
  console.log('staff:',data,error);
  const {data:d2,error:e2}=await db.from('faculty').select('*').limit(5);
  console.log('faculty:',d2,e2);
  const {data:d3,error:e3}=await db.from('notices').select('*').limit(5);
  console.log('notices:',d3,e3);
})()