import { Button, Card, EmptyState, PageHeader } from '@terracelab/trellis-react';
import { Page } from '@terracelab/trellis-blocks/ui';
import { useNavigate } from 'react-router';

export function NotFound() {
  const navigate = useNavigate();
  return (
    <Page header={<PageHeader title="페이지를 찾을 수 없습니다" />}>
      <Card>
        <EmptyState
          icon="search"
          title="주소가 바뀌었거나 없는 화면입니다"
          action={<Button onPress={() => navigate('/')}>홈으로</Button>}
        />
      </Card>
    </Page>
  );
}
