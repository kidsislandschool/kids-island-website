import {createClient} from '@supabase/supabase-js';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
(async()=>{
  const {data,error}=await db.from('faculty').select('*').eq('email','staffnew@test.com');
  console.log('faculty:',data,error);
})()