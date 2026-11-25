import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(url, key)

  const email = 'kidsislandschoolaligarh@gmail.com'
  const password = '@KIBA2001@'
  const name = 'Master Admin'

  const salt = crypto.randomBytes(16)
  const hash = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 })
  const password_hash = `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`

  const { data, error } = await supabase
    .from('users')
    .upsert({
      email,
      name,
      role: 'master_admin',
      password_hash,
      updated_at: new Date().toISOString()
    }, { onConflict: 'email' })
    .select()

  if (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }

  console.log('✅ Admin created/updated:', data)
}

main().catch(e => {
  console.error('Fatal:', e)
  process.exit(1)
})