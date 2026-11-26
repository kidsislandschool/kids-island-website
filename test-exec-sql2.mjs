import {createClient} from '@supabase/supabase-js';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
(async()=>{
  const {data,error}=await db.rpc('exec_sql',{sql:'INSERT INTO staff (email, name, password_hash, status) VALUES ($1, $2, $3, $4) RETURNING id', args:['teacher5@test.com','Test Teacher 5','hash','pending']});
  console.log('error:',error);
  console.log('data:',data);
})()