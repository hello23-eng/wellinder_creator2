import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const ADMIN_EMAIL = 'hello@wellinder.co.kr';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 어드민 검증
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const adminClient = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { data: { user }, error: userError } = await adminClient.auth.getUser(token);
    if (userError || user?.email !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { application_id, action } = await req.json();

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // 신청서 정보 가져오기
    const { data: app, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', application_id)
      .single();

    if (fetchError || !app) {
      return new Response(JSON.stringify({ error: 'Application not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // status 업데이트
    await supabase
      .from('applications')
      .update({ status: action })
      .eq('id', application_id);

    let subject = '';
    let html = '';

    if (action === 'approved') {
      // 72시간짜리 커스텀 초대 토큰 생성
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

      const { error: inviteInsertError } = await supabase
        .from('invites')
        .insert({ token, email: app.email, application_id, expires_at: expiresAt });

      if (inviteInsertError) {
        console.error('Invite insert error:', inviteInsertError.message);
        throw new Error('Failed to create invite token');
      }

      const inviteLink = `https://wellinder.club/accept-invite?token=${token}`;

      subject = '✨ Welcome to Wellinder Creators — You\'re In!';
      html = `
        <div style="font-family: 'Georgia', serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
          <div style="text-align: center; padding: 48px 0 32px;">
            <p style="font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: #999; margin: 0 0 16px;">Wellinder Creators</p>
            <h1 style="font-size: 32px; font-weight: 400; margin: 0; font-style: italic;">You're officially in.</h1>
          </div>
          <div style="padding: 0 32px 48px; line-height: 1.8; color: #444;">
            <p>Dear ${app.full_name},</p>
            <p>
              We're thrilled to welcome you to the <strong>Wellinder Creators</strong> community.
              Your application stood out, and we can't wait to see your journey unfold.
            </p>
            <p>
              Click the button below to set up your password and access <strong>The Lounge</strong> — your exclusive space for missions, announcements, and creator resources.
            </p>
            <p style="color: #999; font-size: 13px;">
              This link expires in <strong>72 hours</strong>. If it expires, please contact us.
            </p>
            <div style="text-align: center; margin: 40px 0;">
              <a href="${inviteLink}" style="background: #1a1a1a; color: white; padding: 16px 40px; border-radius: 999px; text-decoration: none; font-size: 14px; letter-spacing: 0.1em;">
                Accept Your Invitation →
              </a>
            </div>
            <p>Welcome to the collective,<br/><em>Wellinder Team</em></p>
          </div>
        </div>
      `;

    } else if (action === 'rejected') {
      subject = 'Thank you for applying to Wellinder Creators';
      html = `
        <div style="font-family: 'Georgia', serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
          <div style="text-align: center; padding: 48px 0 32px;">
            <p style="font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: #999; margin: 0 0 16px;">Wellinder Creators</p>
            <h1 style="font-size: 32px; font-weight: 400; margin: 0; font-style: italic;">Thank you for applying.</h1>
          </div>
          <div style="padding: 0 32px 48px; line-height: 1.8; color: #444;">
            <p>Dear ${app.full_name},</p>
            <p>
              Thank you for taking the time to apply to <strong>Wellinder Creators</strong>.
              We truly appreciate your interest and the care you've put into your application.
            </p>
            <p>
              At this time, we're not moving forward with your application — but this isn't the end.
              We're expanding to new seasons and new regions, and we'd love to see you again.
            </p>
            <p>
              Keep creating, keep shining, and we hope our paths cross again soon. ✨
            </p>
            <p>With warmth,<br/><em>Wellinder Team</em></p>
          </div>
        </div>
      `;
    }

    // Resend로 이메일 발송
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Wellinder Creators <hello@wellinder.club>',
        to: [app.email],
        subject,
        html,
      }),
    });

    if (!emailRes.ok) {
      const err = await emailRes.text();
      throw new Error(`Resend error: ${err}`);
    }

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
