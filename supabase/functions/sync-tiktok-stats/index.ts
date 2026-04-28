import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const APIFY_TOKEN = Deno.env.get('APIFY_TOKEN')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 승인된 크리에이터들의 TikTok 핸들 가져오기
    const { data: applications, error: appError } = await supabase
      .from('applications')
      .select('tiktok_handle, full_name')
      .not('tiktok_handle', 'is', null)
      .neq('tiktok_handle', '');

    if (appError) throw new Error('Failed to fetch applications: ' + appError.message);
    if (!applications || applications.length === 0) {
      return new Response(JSON.stringify({ message: 'No TikTok handles found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 핸들 정리 (@ 제거, 중복 제거)
    const handles = [...new Set(
      applications
        .map(a => a.tiktok_handle?.replace('@', '').trim().toLowerCase())
        .filter(Boolean)
    )];

    // Apify TikTok Scraper 실행
    const runRes = await fetch(
      `https://api.apify.com/v2/acts/clockworks~tiktok-scraper/runs?token=${APIFY_TOKEN}&waitForFinish=180`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profiles: handles.map(h => `https://www.tiktok.com/@${h}`),
          resultsPerPage: 50,
          proxyConfiguration: { useApifyProxy: true },
        }),
      }
    );

    if (!runRes.ok) {
      throw new Error(`Apify run failed: ${await runRes.text()}`);
    }

    const runData = await runRes.json();
    const runId = runData.data?.id;
    if (!runId) throw new Error('No run ID from Apify');

    // 데이터셋 가져오기
    const dataRes = await fetch(
      `https://api.apify.com/v2/datasets/${runData.data.defaultDatasetId}/items?token=${APIFY_TOKEN}&clean=true&limit=2000`
    );

    if (!dataRes.ok) throw new Error(`Failed to fetch dataset: ${await dataRes.text()}`);

    const videos = await dataRes.json();

    // DB에 upsert
    let upserted = 0;
    for (const v of videos) {
      if (!v.id || !v.webVideoUrl) continue;

      const { error } = await supabase
        .from('tiktok_videos')
        .upsert({
          video_id: String(v.id),
          creator_handle: (v.authorMeta?.name || '').toLowerCase(),
          video_url: v.webVideoUrl,
          views: v.playCount || 0,
          likes: v.diggCount || 0,
          saves: v.collectCount || 0,
          comments: v.commentCount || 0,
          shares: v.shareCount || 0,
          posted_at: v.createTimeISO || null,
          scraped_at: new Date().toISOString(),
        }, { onConflict: 'video_id' });

      if (!error) upserted++;
    }

    return new Response(JSON.stringify({
      success: true,
      handles_synced: handles.length,
      videos_found: videos.length,
      videos_upserted: upserted,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
