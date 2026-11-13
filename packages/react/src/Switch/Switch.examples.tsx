import { Switch } from './Switch.js';

/** 즉시 적용 설정 — 켜면 무엇이 되는지를 라벨로 */
export function Settings() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-12)' }}>
      <Switch defaultChecked description="매월 25일에 거래처별 세금계산서를 발행합니다">
        세금계산서 자동 발행
      </Switch>
      <Switch>결재 요청 메일 알림</Switch>
      <Switch size="sm" defaultChecked>
        표 줄무늬
      </Switch>
      <Switch disabled>외화 환율 자동 반영</Switch>
    </div>
  );
}

/** 크기 — sm · md · lg. lg(48 × 28)는 손가락 크기이고 touch 밀도에서 size를 주지 않으면 lg로 그린다 */
export function Sizes() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-12)' }}>
      <Switch size="sm" defaultChecked>
        표 줄무늬
      </Switch>
      <Switch size="md" defaultChecked>
        결재 요청 메일 알림
      </Switch>
      <Switch size="lg" defaultChecked>
        입고 검수 사진 필수
      </Switch>
    </div>
  );
}
