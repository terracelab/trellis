// 첫 화면. 블록을 복사해 이 자리를 채운다: pnpm ds:add --list
import { Card, EmptyState, PageHeader } from '@terracelab/trellis-react';
import { Page } from '@terracelab/trellis-blocks/ui';
import { SERVICE } from '../service.js';

export function Home() {
  return (
    <Page header={<PageHeader title="홈" description={SERVICE.title} />}>
      <Card>
        <EmptyState
          icon="layout-grid"
          title="아직 화면이 없습니다"
          description="pnpm ds:add --list로 화면 블록을 고르고, 복사한 블록을 이 자리에 넣으세요."
        />
      </Card>
    </Page>
  );
}
