import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const NOTIFY_EMAIL = 'wellinder7@gmail.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // JWT로 유저 확인
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await adminSupabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { password, name, country, survey_a_reasons, survey_a_other, survey_b_goals, survey_b_other } = await req.json();

    // admin API로 비밀번호 + 이름 설정 (magic link 세션에서도 동작)
    await adminSupabase.auth.admin.updateUserById(user.id, {
      password,
      user_metadata: { full_name: name },
    });

    // creator_profiles 저장
    const { error: profileError } = await adminSupabase
      .from('creator_profiles')
      .upsert({
        id: user.id,
        name,
        country,
        survey_a_reasons: survey_a_reasons ?? [],
        survey_a_other: survey_a_other || null,
        survey_b_goals: survey_b_goals ?? [],
        survey_b_other: survey_b_other || null,
      });

    if (profileError) {
      throw new Error('Failed to save profile: ' + profileError.message);
    }

    // 초대 토큰 사용 완료 처리
    await adminSupabase
      .from('invites')
      .update({ used_at: new Date().toISOString() })
      .eq('email', user.email)
      .is('used_at', null);

    // 운영자 이메일 알림 발송
    const reasonsList = (survey_a_reasons ?? []).map((r: string) => `<li>${r}</li>`).join('');
    const goalsList = (survey_b_goals ?? []).map((g: string) => `<li>${g}</li>`).join('');

    const emailHtml = `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; color: #1a1a1a; padding: 40px 0;">
        <p style="font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: #999; margin: 0 0 8px;">Wellinder Creators</p>
        <h1 style="font-size: 26px; font-weight: 400; font-style: italic; margin: 0 0 32px;">New creator signed up</h1>

        <table style="border-collapse: collapse; width: 100%; font-size: 14px; margin-bottom: 32px;">
          <tr>
            <td style="padding: 10px 16px; background: #f9f7f4; color: #666; width: 120px;">Name</td>
            <td style="padding: 10px 16px; background: #f9f7f4;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 16px; color: #666;">Email</td>
            <td style="padding: 10px 16px;">${user.email}</td>
          </tr>
          <tr>
            <td style="padding: 10px 16px; background: #f9f7f4; color: #666;">Country</td>
            <td style="padding: 10px 16px; background: #f9f7f4;">${country}</td>
          </tr>
        </table>

        <h2 style="font-size: 13px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #1a1a1a; margin: 0 0 12px;">A. Why did you join?</h2>
        <ul style="font-size: 14px; color: #444; line-height: 1.8; margin: 0 0 12px; padding-left: 20px;">
          ${reasonsList || '<li style="color:#aaa;">No selections</li>'}
        </ul>
        ${survey_a_other ? `<p style="font-size: 14px; color: #444; border-left: 3px solid #ddd; padding-left: 12px; margin: 0 0 32px;"><em>Additional comment: ${survey_a_other}</em></p>` : '<div style="margin-bottom: 32px;"></div>'}

        <h2 style="font-size: 13px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #1a1a1a; margin: 0 0 12px;">B. Goals for 8 weeks?</h2>
        <ul style="font-size: 14px; color: #444; line-height: 1.8; margin: 0 0 12px; padding-left: 20px;">
          ${goalsList || '<li style="color:#aaa;">No selections</li>'}
        </ul>
        ${survey_b_other ? `<p style="font-size: 14px; color: #444; border-left: 3px solid #ddd; padding-left: 12px; margin: 0;"><em>Additional goal: ${survey_b_other}</em></p>` : ''}
      </div>
    `;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Wellinder Creators <hello@wellinder.club>',
        to: [NOTIFY_EMAIL],
        subject: `New creator sign-up: ${name} (${user.email})`,
        html: emailHtml,
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
