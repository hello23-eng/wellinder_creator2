import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const NOTIFY_EMAIL = 'hello@wellinder.co.kr';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { email, password, name, country, survey_a_reasons, survey_a_other, survey_b_goals, survey_b_other } = await req.json();

    if (!email || !password || !name || !country) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 초대 테이블에서 유효한 초대 확인 (consented_at 있고, used_at 없고, 만료 안 됨)
    const { data: invite, error: inviteError } = await adminSupabase
      .from('invites')
      .select('*')
      .eq('email', email)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .not('consented_at', 'is', null)
      .single();

    if (inviteError || !invite) {
      return new Response(JSON.stringify({ error: 'Invalid or expired invitation' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // auth.users에서 유저 찾기
    const { data: { users }, error: listError } = await adminSupabase.auth.admin.listUsers();
    if (listError) throw new Error('Failed to list users');

    const user = users.find((u) => u.email === email);
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 비밀번호 + 이름 설정
    await adminSupabase.auth.admin.updateUserById(user.id, {
      password,
      user_metadata: { full_name: name },
    });

    // creator_profiles 저장
    const { error: profileError } = await adminSupabase
      .from('creator_profiles')
      .upsert({
        id: user.id,
        email: user.email,
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
      .eq('email', email)
      .is('used_at', null);

    // 운영자 이메일 알림
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
            <td style="padding: 10px 16px;">${email}</td>
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
        subject: `New creator sign-up: ${name} (${email})`,
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
