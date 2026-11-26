import {createClient} from '@supabase/supabase-js';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
(async()=>{
  const {data,error}=await db.rpc('exec_sql',{sql:'INSERT INTO staff (email, name, phone, designation, qualification, bio, password_hash, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id', args:['teacher4@test.com','Test Teacher 4','9876543210','Teacher','M.Sc','Test bio','hash','pending']});
  console.log('error:',error);
  console.log('data:',data);
})()