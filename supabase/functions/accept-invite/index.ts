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
    const { token } = await req.json();

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

    // 이미 사용된 토큰
    if (invite.used_at) {
      return new Response(JSON.stringify({ error: 'This invitation has already been used.' }), {
        status: 410,
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

    // Supabase 로그인 링크 생성 (이메일 발송 없이)
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'invite',
      email: invite.email,
      options: {
        redirectTo: 'https://wellinder.club/reset-password',
      },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error('generateLink error:', linkError?.message);
      throw new Error('Failed to generate login link');
    }

    // 토큰 사용 처리
    await supabase
      .from('invites')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token);

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
