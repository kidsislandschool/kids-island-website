import {createClient} from '@supabase/supabase-js';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
(async()=>{
  const {data,error}=await db.from('staff').select('*').eq('status','pending');
  console.log('pending staff:',data,error);
  if(data&&data.length>0){
    const id = data[0].id;
    const {data:upd,error:upderr}=await db.from('staff').update({status:'approved',approved_at:new Date().toISOString()}).eq('id',id).select();
    console.log('approved:',upd,upderr);
    const {data:fac,error:facerr}=await db.from('faculty').select('*').eq('email',data[0].email);
    console.log('faculty auto-created:',fac,facerr);
  }
})()