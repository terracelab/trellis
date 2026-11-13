// 플랫폼 기본 · 권한 없음(403): 역할로 볼 수 없는 화면을 열었을 때 영역 가운데에 안내 · 요청 ID · 이전 화면 · 홈으로를 둔다.
// 요청 ID는 관리자가 감사 로그에서 거절 기록을 찾는 값이다. 필요한 권한(?module=&action=)이 오면 한 줄로 보인다
import { Button, EmptyState } from '@terracelab/trellis-react';
import modules from '@terracelab/trellis-tokens/modules';
import { PROFILE } from '../../../_data/profile.js';
import {
  ACTION_LABELS,
  COMPANY,
  useScreenParams,
  useScreens,
  type Action,
} from '../../../_platform/index.js';
import '../not-found/style.css';

// slot: home — "홈으로"가 가는 화면(블록 id)
const HOME = 'home/dashboard/trade';
// slot: home end

// slot: request — 서버가 403 응답에 준 요청 ID(?requestId=). 데모는 이 값을 쓴다
const DEMO_REQUEST_ID = 'req-261106-4f0c';
// slot: request end

const canGoBack = () => typeof window !== 'undefined' && window.history.length > 1;

export default function Forbidden() {
  const screens = useScreens();
  const params = useScreenParams();
  const requestId = params['requestId'] ?? DEMO_REQUEST_ID;
  const moduleLabel = modules.modules.find((m) => m.id === params['module'])?.label;
  const actionLabel = ACTION_LABELS[params['action'] as Action];
  return (
    <div className="tl-block-error">
      <p className="tl-block-error__brand">{COMPANY.name}</p>
      <div className="tl-block-error__body">
        <EmptyState
          kind="forbidden"
          headingLevel={1}
          title="이 화면을 볼 권한이 없습니다"
          description={`${PROFILE.people.admin}에게 권한을 요청하세요. 요청할 때 아래 요청 ID를 알려 주세요`}
          requestId={requestId}
          action={
            <>
              {canGoBack() && (
                <Button variant="primary" icon="arrow-left" onPress={() => window.history.back()}>
                  이전 화면
                </Button>
              )}
              {screens.has(HOME) && (
                <Button
                  variant={canGoBack() ? 'secondary' : 'primary'}
                  icon="house"
                  onPress={() => screens.go(HOME)}
                >
                  홈으로
                </Button>
              )}
            </>
          }
        />
        {moduleLabel && actionLabel && (
          <p className="tl-block-error__note">
            필요한 권한 {moduleLabel} · {actionLabel}
          </p>
        )}
      </div>
    </div>
  );
}
