import {createClient} from '@supabase/supabase-js';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
(async()=>{
  const {data,error}=await db.rpc('exec_sql',{sql:`ALTER TABLE red_flags ADD COLUMN IF NOT EXISTS student_id INTEGER REFERENCES students(id) ON DELETE CASCADE`});
  console.log('add student_id:',data,error);
  const {data:data2,error:error2}=await db.rpc('exec_sql',{sql:'ALTER TABLE red_flags DROP COLUMN IF EXISTS student_id CASCADE'});
  console.log('drop old student_id:',data2,error2);
  const {data:data3,error:error3}=await db.rpc('exec_sql',{sql:'ALTER TABLE red_flags ADD COLUMN student_id INTEGER REFERENCES students(id) ON DELETE CASCADE'});
  console.log('add new student_id:',data3,error3);
})()