import {createClient} from '@supabase/supabase-js';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
(async()=>{
  const {data,error}=await db.from('gallery_albums').select('*').eq('status','published');
  console.log('albums:',data,error);
  if(data){
    data.forEach(a=>console.log(a.id, a.title, 'cover_photo:', a.cover_photo));
  }
})()