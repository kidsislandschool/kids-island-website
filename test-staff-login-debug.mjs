import {createClient} from '@supabase/supabase-js';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
(async()=>{
  const {data,error}=await db.from('staff').select('*').eq('email','teacher9@test.com');
  console.log('staff:',data,error);
  if(data&&data.length>0){
    const { verifyPassword } = await import('@/lib/password');
    const valid = await verifyPassword('password123', data[0].password_hash);
    console.log('verify:',valid);
    const { createStaffSession } = await import('@/lib/auth');
    const token = await createStaffSession({ id: data[0].id, email: data[0].email, name: data[0].name, role: 'staff' }, { ip: 'test', userAgent: 'test' });
    console.log('token:', token);
  }
})()