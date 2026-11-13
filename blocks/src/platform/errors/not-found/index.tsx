// 플랫폼 기본 · 주소 없음(404): 주소에 화면이 없을 때 영역 가운데에 안내와 홈으로 · 이전 화면을 둔다.
// AppShell 안(내용 영역)과 밖(로그인 전 · 틀 없는 화면) 어디서나 같은 모양이다. 앱 라우터의 남은 경로(*)가 그린다
import { Button, EmptyState } from '@terracelab/trellis-react';
import { COMPANY, useScreenParams, useScreens } from '../../../_platform/index.js';
import './style.css';

// slot: home — "홈으로"가 가는 화면(블록 id)
const HOME = 'home/dashboard/trade';
// slot: home end

/** 뒤로 갈 기록이 있는지(주소를 바로 열었으면 없다) */
const canGoBack = () => typeof window !== 'undefined' && window.history.length > 1;

export default function NotFound() {
  const screens = useScreens();
  // 앱 라우터가 넘기는 요청 주소(?path=). 없으면 줄을 그리지 않는다
  const { path } = useScreenParams();
  return (
    <div className="tl-block-error">
      <p className="tl-block-error__brand">{COMPANY.name}</p>
      <div className="tl-block-error__body">
        <EmptyState
          kind="notFound"
          headingLevel={1}
          action={
            <>
              {screens.has(HOME) && (
                <Button variant="primary" icon="house" onPress={() => screens.go(HOME)}>
                  홈으로
                </Button>
              )}
              {canGoBack() && (
                <Button icon="arrow-left" onPress={() => window.history.back()}>
                  이전 화면
                </Button>
              )}
            </>
          }
        />
        {path && (
          <p className="tl-block-error__note">
            요청한 주소 <code className="tl-block-error__code">{path}</code>
          </p>
        )}
      </div>
    </div>
  );
}
