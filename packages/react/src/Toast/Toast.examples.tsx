import { useState } from 'react';
import { ActionBar } from '../ActionBar/ActionBar.js';
import { Button } from '../Button/Button.js';
import { Drawer } from '../Drawer/Drawer.js';
import { Toast, ToastProvider, useToast } from './Toast.js';

/** 띄우기 — 앱 루트를 ToastProvider로 한 번 감싸고 useToast().show로 띄운다. 같은 토스트를 다시 띄우면 ×N으로 센다 */
export function ShowToast() {
  const toast = useToast();
  return (
    <ToastProvider>
      <div style={{ display: 'flex', gap: 'var(--tl-space-8)', flexWrap: 'wrap' }}>
        <Button
          variant="primary"
          onPress={() => toast.show({ title: '발주서를 저장했습니다', tone: 'success' })}
        >
          저장
        </Button>
        <Button
          onPress={() =>
            toast.show({
              title: '거래처 3곳을 삭제했습니다',
              action: { label: '되돌리기', onPress: () => {} },
            })
          }
        >
          삭제
        </Button>
        <Button
          onPress={() =>
            toast.show({
              title: '국세청 전송에 실패했습니다',
              description: '공급받는자 사업자등록번호를 확인하세요',
              tone: 'danger',
            })
          }
        >
          전송
        </Button>
      </div>
    </ToastProvider>
  );
}

/** 톤 — 글자는 중립이고 톤은 앞 아이콘과 왼쪽 띠로 보인다 */
export function Tones() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-8)',
        maxWidth: 'calc(var(--tl-space-64) * 5.5)',
      }}
    >
      <Toast title="입고 12건을 확정했습니다" tone="success" />
      <Toast title="결재를 요청했습니다" description="다음 결재자 박서연 팀장" tone="info" />
      <Toast title="안전재고 아래 품목이 4개입니다" tone="warning" />
      <Toast
        title="반려했습니다"
        tone="neutral"
        action={{ label: '되돌리기', onPress: () => {} }}
        onClose={() => {}}
      />
    </div>
  );
}

/** 아래 단추 위로 — 고정 ActionBar · 아래 서랍 footer · 휴대폰 탭바가 있으면 토스트가 그 위에 뜬다 */
export function AboveBottomActions() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  return (
    <ToastProvider>
      <div style={{ display: 'grid', gap: 'var(--tl-space-16)' }}>
        <Button onPress={() => setOpen(true)}>아래 서랍 열기</Button>
        <Drawer
          open={open}
          onOpenChange={setOpen}
          side="bottom"
          title="직원 정보"
          footer={
            <Button variant="primary" onPress={() => toast.show({ title: '정보를 수정했습니다' })}>
              수정
            </Button>
          }
        >
          수정을 누르면 토스트가 수정 단추 위에 뜹니다
        </Drawer>
        <ActionBar sticky>
          <Button
            variant="primary"
            onPress={() => toast.show({ title: '발행했습니다', tone: 'success' })}
          >
            발행
          </Button>
        </ActionBar>
      </div>
    </ToastProvider>
  );
}
