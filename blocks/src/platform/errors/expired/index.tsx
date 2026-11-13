// 플랫폼 기본 · 로그인 만료: 비활동 시간이 지나 세션이 끝났을 때 영역 가운데에 안내와 다시 로그인 단추를 둔다.
// 로그인 화면에 보던 화면(?next=)을 넘긴다. 틀 없이 전체 화면으로도, AppShell 내용 영역 안에서도 그린다
import { Button, EmptyState } from '@terracelab/trellis-react';
import { COMPANY, useScreenParams, useScreens } from '../../../_platform/index.js';
import '../not-found/style.css';

// slot: session — 로그인 화면(블록 id)과 비활동 기준(platform.md §2 세션: 8시간)
const LOGIN = 'platform/auth/login';
const IDLE_HOURS = 8;
// slot: session end

export default function Expired() {
  const screens = useScreens();
  // 만료 전에 보던 화면(?next=블록 id). 로그인 뒤 그 화면으로 돌려보낼 때 쓴다
  const { next } = useScreenParams();
  return (
    <div className="tl-block-error">
      <p className="tl-block-error__brand">{COMPANY.name}</p>
      <div className="tl-block-error__body">
        <EmptyState
          kind="expired"
          headingLevel={1}
          title="로그인이 만료되었습니다"
          description={`${IDLE_HOURS}시간 동안 활동이 없어 로그아웃했습니다. 다시 로그인한 뒤 이어서 작업하세요`}
          action={
            screens.has(LOGIN) ? (
              <Button
                variant="primary"
                icon="log-in"
                onPress={() => screens.go(LOGIN, next ? { next } : undefined)}
              >
                다시 로그인
              </Button>
            ) : undefined
          }
        />
      </div>
    </div>
  );
}
