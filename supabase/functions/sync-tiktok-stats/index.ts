import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const APIFY_TOKEN = Deno.env.get('APIFY_TOKEN')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ACTOR_ID = 'clockworks~tiktok-scraper';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: creators, error } = await supabase
      .from('tracked_creators')
      .select('handle');
    if (error) throw error;
    if (!creators?.length) {
      return new Response(JSON.stringify({ message: 'No creators' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const profiles = creators.map(c =>
      `https://www.tiktok.com/@${c.handle.replace('@', '').toLowerCase()}`
    );

    // 3일 전 날짜 계산
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const oldestDate = threeDaysAgo.toISOString().split('T')[0]; // YYYY-MM-DD

    // Start Apify run — waitForFinish=120s
    const runRes = await fetch(
      `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${APIFY_TOKEN}&waitForFinish=120`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profiles,
          resultsPerPage: 10,
          oldestPostDate: oldestDate,
          shouldDownloadVideos: false,
          shouldDownloadCovers: false,
          shouldDownloadAvatars: false,
          shouldDownloadMusicCovers: false,
          shouldDownloadSlideshowImages: false,
          commentsPerPost: 0,
          maxFollowersPerProfile: 0,
          maxFollowingPerProfile: 0,
          maxRepliesPerComment: 0,
          scrapeRelatedVideos: false,
          excludePinnedPosts: false,
        }),
      }
    );

    if (!runRes.ok) {
      const err = await runRes.text();
      throw new Error(`Apify error: ${err.slice(0, 300)}`);
    }

    const run = await runRes.json();
    const runStatus = run?.data?.status;
    const datasetId = run?.data?.defaultDatasetId;

    if (runStatus !== 'SUCCEEDED') {
      return new Response(JSON.stringify({
        success: false,
        message: `Run still ${runStatus ?? 'running'} — wait a minute then sync again`,
        run_id: run?.data?.id,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch results
    const itemsRes = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}&clean=true&limit=500`,
    );
    if (!itemsRes.ok) throw new Error(`Dataset fetch failed: ${itemsRes.status}`);
    const items: any[] = await itemsRes.json();

    let upserted = 0;
    const errors: string[] = [];

    const cutoff = Date.now() - 3 * 24 * 60 * 60 * 1000;

    for (const item of items) {
      const videoId = String(item.id ?? '');
      if (!videoId) continue;

      // 3일 이내 영상만 저장
      if (item.createTime && item.createTime * 1000 < cutoff) continue;

      const handle = (item.authorMeta?.name ?? '').toLowerCase().replace('@', '');
      const { error: upsertErr } = await supabase
        .from('tiktok_videos')
        .upsert({
          video_id: videoId,
          video_url: item.webVideoUrl ?? `https://www.tiktok.com/@${handle}/video/${videoId}`,
          creator_handle: handle,
          views: item.playCount ?? 0,
          likes: item.diggCount ?? 0,
          saves: item.collectCount ?? 0,
          comments: item.commentCount ?? 0,
          shares: item.shareCount ?? 0,
          posted_at: item.createTime ? new Date(item.createTime * 1000).toISOString() : null,
          scraped_at: new Date().toISOString(),
        }, { onConflict: 'video_id' });

      if (upsertErr) errors.push(`${handle}/${videoId}: ${upsertErr.message}`);
      else upserted++;
    }

    return new Response(JSON.stringify({
      success: true,
      creators_synced: creators.length,
      videos_upserted: upserted,
      errors,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
