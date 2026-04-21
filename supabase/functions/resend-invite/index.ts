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

    const { application_id } = await req.json();
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const { data: app, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', application_id)
      .single();

    if (fetchError || !app) {
      return new Response(JSON.stringify({ error: 'Application not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (app.status !== 'approved') {
      return new Response(JSON.stringify({ error: 'Application is not approved' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 기존 미사용 초대 토큰 삭제
    await supabase
      .from('invites')
      .delete()
      .eq('application_id', application_id)
      .is('used_at', null);

    // 새 초대 토큰 생성 (72시간)
    const newToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

    const { error: inviteInsertError } = await supabase
      .from('invites')
      .insert({ token: newToken, email: app.email, application_id, expires_at: expiresAt });

    if (inviteInsertError) {
      throw new Error('Failed to create invite token');
    }

    const inviteLink = `https://wellinder.club/accept-invite?token=${newToken}`;

    const html = `
      <div style="font-family: 'Georgia', serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <div style="text-align: center; padding: 48px 0 32px;">
          <p style="font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: #999; margin: 0 0 16px;">Wellinder Creators</p>
          <h1 style="font-size: 32px; font-weight: 400; margin: 0; font-style: italic;">You're officially in.</h1>
        </div>
        <div style="padding: 0 32px 48px;">
        <p>Dear ${app.full_name} (@${app.instagram_handle}),</p>
        <p>You've been selected for the Wellinder Creator Challenge — congratulations!</p>
        <p>Click the button below to set your password and access <strong>The Lounge</strong>, where it all begins.</p>
        <div style="text-align: center; margin: 40px 0;">
          <a href="${inviteLink}" style="display: inline-block; background: #1a1a1a; color: white; padding: 16px 40px; border-radius: 999px; text-decoration: none; font-size: 14px; letter-spacing: 0.1em; white-space: nowrap;">
            Accept Your Invitation →
          </a>
        </div>
        <p style="color: #999; font-size: 13px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee;">This link expires in <strong>72 hours</strong>. If registration is not completed within that time, your invitation will be automatically cancelled.</p>
        <p>Welcome to the collective,<br/><em>Wellinder Team</em></p>
        <p style="color: #999; font-size: 13px;">If you have any questions, feel free to reach out at <a href="mailto:hello@wellinder.co.kr" style="color: #1a1a1a;">hello@wellinder.co.kr</a></p>
        </div>
      </div>
    `;

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Wellinder Creators <hello@wellinder.club>',
        to: [app.email],
        subject: '✨ Welcome to Wellinder Creators — You\'re In!',
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
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
