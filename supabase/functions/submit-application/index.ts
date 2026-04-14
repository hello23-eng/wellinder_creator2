import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RATE_LIMIT = 5;
const WINDOW_HOURS = 24;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // 24시간 내 같은 IP 제출 횟수 확인
  const since = new Date(Date.now() - WINDOW_HOURS * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from('submission_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .gte('created_at', since);

  if ((count ?? 0) >= RATE_LIMIT) {
    return new Response(
      JSON.stringify({ error: 'rate_limited' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const body = await req.json();
  const { full_name, tiktok_handle, instagram_handle, email, country } = body;

  // 신청서 저장
  const { error: insertError } = await supabase.from('applications').insert([{
    full_name,
    tiktok_handle,
    instagram_handle,
    email,
    country,
    status: 'pending',
  }]);

  if (insertError) {
    return new Response(
      JSON.stringify({ error: insertError.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // 제출 기록
  await supabase.from('submission_attempts').insert([{ ip_address: ip }]);

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
