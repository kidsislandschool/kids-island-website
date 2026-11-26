import {createClient} from '@supabase/supabase-js';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
(async()=>{
  const start = Date.now();
  const [{ count: inquiriesNew }, { count: facultyPublished }, { count: materialsPublished }, { count: noticesPublished }] = await Promise.all([
    db.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    db.from('faculty').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    db.from('materials').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    db.from('notices').select('*', { count: 'exact', head: true }).eq('status', 'published'),
  ]);
  console.log('Time:', Date.now() - start, 'ms');
  console.log('inquiriesNew:', inquiriesNew);
  console.log('facultyPublished:', facultyPublished);
  console.log('materialsPublished:', materialsPublished);
  console.log('noticesPublished:', noticesPublished);
})()