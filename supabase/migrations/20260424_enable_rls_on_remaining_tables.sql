-- ============================================================
-- RLS 보안 조치: 공개 접근 차단
-- invites, submission_attempts, applications, lounge_posts
-- ============================================================

-- 1. invites
--    Edge Function(service_role)만 접근 → RLS 켜되 일반 유저 정책 없음
--    어드민은 이메일로 직접 확인 가능하도록 select 허용
alter table invites enable row level security;

create policy "Admin can manage invites"
  on invites for all
  using (auth.email() = 'hello@wellinder.co.kr');

-- 2. submission_attempts
--    IP 기록용 테이블, Edge Function(service_role)만 접근
--    일반 유저는 아예 볼 수 없어야 함
alter table submission_attempts enable row level security;

-- 정책 없음 = 인증된 유저도 접근 불가 (service_role은 RLS 우회)

-- 3. applications
--    신청자 개인정보(이름, 이메일, SNS 핸들) 포함
--    Edge Function(service_role)이 insert, 어드민이 review
alter table applications enable row level security;

create policy "Admin can manage applications"
  on applications for all
  using (auth.email() = 'hello@wellinder.co.kr');

-- 4. lounge_posts
--    정책은 이미 정의됨(20260414), RLS 활성화만 누락됨
alter table lounge_posts enable row level security;
