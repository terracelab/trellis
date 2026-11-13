import type { ReactNode } from 'react';
import { Field } from '../Field/Field.js';
import { Input } from '../Input/Input.js';
import { AgentReplay } from './AgentReplay.js';

// 재생 아래에 깔린 화면(액자). 좌표는 이 액자 왼쪽 위 기준이다(container = null)
const ReplayScreen = ({ children, narrow = false }: { children: ReactNode; narrow?: boolean }) => (
  <div
    style={{
      position: 'relative',
      width: narrow ? 'calc(var(--tl-space-64) * 6)' : '100%',
      height: 'calc(var(--tl-space-64) * 5)',
      overflow: 'hidden',
      border: 'var(--tl-border-width-1) solid var(--tl-color-border-divider)',
      borderRadius: 'var(--tl-radius-lg)',
      background: 'var(--tl-color-bg-canvas)',
    }}
  >
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        width: 'calc(var(--tl-space-64) * 5)',
        maxWidth: 'calc(100% - var(--tl-space-48))',
        padding: 'var(--tl-space-24)',
      }}
    >
      <Field label="거래처">
        <Input defaultValue="한빛상사" />
      </Field>
      <Field label="공급가액(원)">
        <Input defaultValue="" placeholder="0" />
      </Field>
    </div>
    {children}
  </div>
);

/** 하는 중 — 이름표 단 커서, 지금 칸 테두리, 아래 진행 띠(건너뛰기 · 멈추기) */
export function Running() {
  return (
    <ReplayScreen>
      <AgentReplay
        container={null}
        status="running"
        label="업무 도우미"
        labelColor="series-1"
        caption="공급가액 칸에 1,200,000을 넣는 중"
        trail={['회계', '세금계산서', '작성']}
        index={3}
        total={7}
        remaining="약 20초 남음"
        ring={{ x: 24, y: 124, width: 320, height: 36 }}
        pointer={{ x: 220, y: 140 }}
        ripples={[]}
        onSkip={() => {}}
        onStop={() => {}}
      />
    </ReplayScreen>
  );
}

/** 끝남 — 체크 · 요약 · 결과 보기 · 닫기. 커서와 테두리는 사라진다 */
export function Done() {
  return (
    <ReplayScreen>
      <AgentReplay
        container={null}
        status="done"
        label="업무 도우미"
        labelColor="series-1"
        caption="발행했습니다"
        summary="세금계산서 1건을 발행했습니다"
        onOpenResult={() => {}}
        onStop={() => {}}
      />
    </ReplayScreen>
  );
}

/** 상태 — 하는 중 · 멈춤 · 끝남 띠. 띠 밖은 누를 수 없어 disabled · loading · error가 없다(실패는 caption 글) */
export function States() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-16)' }}>
      {(['running', 'stopped', 'done'] as const).map((status) => (
        <div
          key={status}
          style={{
            position: 'relative',
            height: 'calc(var(--tl-space-64) + var(--tl-space-32))',
            border: 'var(--tl-border-width-1) solid var(--tl-color-border-divider)',
            borderRadius: 'var(--tl-radius-lg)',
            background: 'var(--tl-color-bg-canvas)',
          }}
        >
          <AgentReplay
            container={null}
            status={status}
            label="업무 도우미"
            labelColor="series-1"
            caption="거래처 칸을 확인하는 중"
            summary="세금계산서 1건을 발행했습니다"
            index={2}
            total={7}
            onSkip={() => {}}
            onStop={() => {}}
            onOpenResult={() => {}}
          />
        </div>
      ))}
    </div>
  );
}

/** 휴대폰 — 탭바 위 좌우 꽉 찬 띠, 길은 숨긴다 */
export function Phone() {
  return (
    <ReplayScreen narrow>
      <AgentReplay
        container={null}
        status="running"
        label="업무 도우미"
        labelColor="series-1"
        caption="거래처 칸을 확인하는 중"
        trail={['회계', '세금계산서', '작성']}
        index={2}
        total={7}
        ring={{ x: 24, y: 49, width: 320, height: 46 }}
        pointer={{ x: 160, y: 72 }}
        onSkip={() => {}}
        onStop={() => {}}
      />
    </ReplayScreen>
  );
}
