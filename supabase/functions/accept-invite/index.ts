import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { token, preview } = await req.json();

    if (!token) {
      return new Response(JSON.stringify({ error: 'Missing token' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // 토큰 조회
    const { data: invite, error: fetchError } = await supabase
      .from('invites')
      .select('*')
      .eq('token', token)
      .single();

    if (fetchError || !invite) {
      return new Response(JSON.stringify({ error: 'Invalid invitation link.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 만료 확인
    if (new Date(invite.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'This invitation has expired. Please contact us.' }), {
        status: 410,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 이미 가입 완료된 유저인지 확인 (used_at이 기록된 경우)
    if (invite.used_at) {
      return new Response(JSON.stringify({ already_registered: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // preview 모드: 유효성만 확인하고 토큰 소비 안 함
    if (preview) {
      return new Response(JSON.stringify({ valid: true, email: invite.email }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 실제 가입 처리: 유저가 이미 존재할 수 있으므로 upsert 후 magiclink 생성
    await supabase.auth.admin.createUser({
      email: invite.email,
      email_confirm: true,
    });

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: invite.email,
      options: {
        redirectTo: 'https://wellinder.club/reset-password',
      },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error('generateLink error:', linkError?.message);
      throw new Error('Failed to generate login link');
    }

    // 최초 클릭 시 동의 시각 기록 (used_at은 가입 완료 후 complete-signup에서 기록)
    if (!invite.consented_at) {
      await supabase
        .from('invites')
        .update({ consented_at: new Date().toISOString() })
        .eq('token', token);
    }

    return new Response(JSON.stringify({ url: linkData.properties.action_link }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
