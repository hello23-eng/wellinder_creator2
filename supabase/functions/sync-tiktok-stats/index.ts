import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function extractVideoId(url: string): string {
  const match = url.match(/video\/(\d+)/);
  return match ? match[1] : '';
}

async function fetchVideoStats(videoUrl: string) {
  const videoId = extractVideoId(videoUrl);
  const apiUrl = `https://tiktok-scraper2.p.rapidapi.com/video/info_v2?video_url=${encodeURIComponent(videoUrl)}&video_id=${videoId}`;

  const res = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'tiktok-scraper2.p.rapidapi.com',
      'x-rapidapi-key': RAPIDAPI_KEY,
    },
  });

  if (!res.ok) throw new Error(`RapidAPI error ${res.status}: ${await res.text()}`);
  return res.json();
}

function parseStats(json: any) {
  const detail = json?.data?.aweme_detail ?? json?.data ?? {};
  const stats = detail.statistics ?? detail.stats ?? {};
  const author = detail.author ?? {};

  return {
    video_id: String(detail.aweme_id ?? detail.id ?? extractVideoId('')),
    creator_handle: (author.unique_id ?? author.uniqueId ?? '').toLowerCase(),
    views: stats.play_count ?? stats.playCount ?? 0,
    likes: stats.digg_count ?? stats.diggCount ?? 0,
    saves: stats.collect_count ?? stats.collectCount ?? 0,
    comments: stats.comment_count ?? stats.commentCount ?? 0,
    shares: stats.share_count ?? stats.shareCount ?? 0,
    posted_at: detail.create_time
      ? new Date(detail.create_time * 1000).toISOString()
      : null,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json().catch(() => ({}));

    // ── 단일 영상 ──────────────────────────────────────────────────────────────
    if (body.video_url) {
      const json = await fetchVideoStats(body.video_url);
      const parsed = parseStats(json);

      const videoId = parsed.video_id || extractVideoId(body.video_url);
      const handle = parsed.creator_handle || (body.creator_handle ?? '').toLowerCase().replace('@', '');

      const { error } = await supabase.from('tiktok_videos').upsert({
        video_id: videoId,
        video_url: body.video_url,
        creator_handle: handle,
        views: parsed.views,
        likes: parsed.likes,
        saves: parsed.saves,
        comments: parsed.comments,
        shares: parsed.shares,
        posted_at: parsed.posted_at,
        scraped_at: new Date().toISOString(),
      }, { onConflict: 'video_id' });

      if (error) throw new Error('DB upsert failed: ' + error.message);

      return new Response(JSON.stringify({ success: true, video_id: videoId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── 전체 sync (admin) ──────────────────────────────────────────────────────
    if (body.sync_all) {
      const { data: submissions } = await supabase
        .from('video_submissions')
        .select('video_url, user_email');

      let processed = 0;
      const errors: string[] = [];

      for (const sub of (submissions ?? [])) {
        try {
          const { data: appData } = await supabase
            .from('applications')
            .select('tiktok_handle')
            .eq('email', sub.user_email)
            .limit(1)
            .maybeSingle();

          const json = await fetchVideoStats(sub.video_url);
          const parsed = parseStats(json);

          const videoId = parsed.video_id || extractVideoId(sub.video_url);
          const handle = parsed.creator_handle
            || (appData?.tiktok_handle ?? '').toLowerCase().replace('@', '');

          const { error } = await supabase.from('tiktok_videos').upsert({
            video_id: videoId,
            video_url: sub.video_url,
            creator_handle: handle,
            views: parsed.views,
            likes: parsed.likes,
            saves: parsed.saves,
            comments: parsed.comments,
            shares: parsed.shares,
            posted_at: parsed.posted_at,
            scraped_at: new Date().toISOString(),
          }, { onConflict: 'video_id' });

          if (error) errors.push(`${sub.video_url}: ${error.message}`);
          else processed++;
        } catch (e: any) {
          errors.push(`${sub.video_url}: ${e.message}`);
        }
      }

      return new Response(JSON.stringify({ success: true, processed, errors }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'video_url or sync_all required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
