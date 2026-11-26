import {createClient} from '@supabase/supabase-js';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
(async()=>{
  const {data,error}=await db.from('staff_sessions').select('*').limit(5);
  console.log('staff_sessions:',data,error);
  if(data&&data.length>0){
    console.log('columns:',Object.keys(data[0]));
  }
})()