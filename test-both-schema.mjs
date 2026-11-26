import {createClient} from '@supabase/supabase-js';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
(async()=>{
  const {data,error}=await db.from('materials').select('*').limit(1);
  console.log('materials:',data,error);
  if(data&&data.length>0){
    console.log('columns:',Object.keys(data[0]));
  }
  const {data:d2,error:e2}=await db.from('testimonials').select('*').limit(1);
  console.log('testimonials:',d2,e2);
  if(d2&&d2.length>0){
    console.log('columns:',Object.keys(d2[0]));
  }
})()