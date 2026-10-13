// Starts this shop's own 15-day Expense Tracker trial (once per email).
import { createClient } from '@supabase/supabase-js'
import { json } from '../_lib/http.js'

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return new Response(null, { status: 405 })
  const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  const jwt = (request.headers.get('authorization') || '').replace(/^Bearer /, '')
  const { data: { user } } = await sb.auth.getUser(jwt)
  if (!user) return json({ error: 'Not signed in' }, 401)
  const { data: shop } = await sb.from('shops').select('id').eq('owner_id', user.id).maybeSingle()
  if (!shop) return json({ error: 'Shop not found' }, 404)
  const { error } = await sb.rpc('start_trial', { p_shop: shop.id, p_product: 'expenses' })
  if (error) return json({ error: 'Your free trial for this product was already used, or your account is not approved yet. Contact Stellar Forge.' }, 409)
  return json({ ok: true })
}