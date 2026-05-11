import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 핸들로 최근 영상 목록 가져오기 (1 API call per creator)
async function fetchUserVideos(handle: string) {
  const username = handle.replace('@', '');
  const url = `https://tiktok-scraper2.p.rapidapi.com/user/posts?username=${encodeURIComponent(username)}&count=20&cursor=0`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'tiktok-scraper2.p.rapidapi.com',
      'x-rapidapi-key': RAPIDAPI_KEY,
    },
  });

  if (!res.ok) throw new Error(`RapidAPI error ${res.status}: ${await res.text()}`);
  return res.json();
}

function parseVideoList(json: any, fallbackHandle: string): any[] {
  // 다양한 응답 구조 대응
  const data = json?.data ?? {};
  const list: any[] = data.aweme_list ?? data.videos ?? data.itemList ?? [];
  return list;
}

function mapVideo(v: any, fallbackHandle: string) {
  const stats = v.statistics ?? v.stats ?? {};
  const author = v.author ?? {};
  const createTime = v.create_time ?? v.createTime;

  return {
    video_id: String(v.aweme_id ?? v.id ?? ''),
    video_url: v.video?.play_addr?.url_list?.[0]
      ?? `https://www.tiktok.com/@${fallbackHandle}/video/${v.aweme_id ?? v.id}`,
    creator_handle: (author.unique_id ?? author.uniqueId ?? fallbackHandle).toLowerCase().replace('@', ''),
    views: stats.play_count ?? stats.playCount ?? 0,
    likes: stats.digg_count ?? stats.diggCount ?? 0,
    saves: stats.collect_count ?? stats.collectCount ?? 0,
    comments: stats.comment_count ?? stats.commentCount ?? 0,
    shares: stats.share_count ?? stats.shareCount ?? 0,
    posted_at: createTime ? new Date(createTime * 1000).toISOString() : null,
    scraped_at: new Date().toISOString(),
  };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // tracked_creators에서 핸들 목록 가져오기
    const { data: creators, error: creatorsError } = await supabase
      .from('tracked_creators')
      .select('handle');

    if (creatorsError) throw new Error('tracked_creators 조회 실패: ' + creatorsError.message);
    if (!creators || creators.length === 0) {
      return new Response(JSON.stringify({ message: 'No tracked creators' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let totalUpserted = 0;
    const errors: string[] = [];

    for (const creator of creators) {
      const handle = creator.handle;
      try {
        const json = await fetchUserVideos(handle);
        const videoList = parseVideoList(json, handle);

        for (const v of videoList) {
          const mapped = mapVideo(v, handle);
          if (!mapped.video_id) continue;

          const { error } = await supabase
            .from('tiktok_videos')
            .upsert(mapped, { onConflict: 'video_id' });

          if (error) errors.push(`${handle}/${mapped.video_id}: ${error.message}`);
          else totalUpserted++;
        }
      } catch (e: any) {
        errors.push(`${handle}: ${e.message}`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      creators_synced: creators.length,
      videos_upserted: totalUpserted,
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
