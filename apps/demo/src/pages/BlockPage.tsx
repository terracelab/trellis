import { PageHeader, Spinner } from '@terracelab/trellis-react';
import { Component, Suspense, type ReactNode } from 'react';
import { blockById, screenOf } from '../registry.js';

class Boundary extends Component<{ children: ReactNode; id: string }, { error: Error | null }> {
  override state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  override componentDidUpdate(prev: { id: string }) {
    if (prev.id !== this.props.id && this.state.error) this.setState({ error: null });
  }
  override render() {
    if (this.state.error)
      return (
        <div className="tl-demo-message">
          <PageHeader title="화면을 그리지 못했습니다" description={this.state.error.message} />
        </div>
      );
    return this.props.children;
  }
}

export function BlockPage({ id }: { id: string }) {
  const Screen = screenOf(id);
  const meta = blockById(id);
  if (!Screen || !meta)
    return (
      <div className="tl-demo-message">
        <PageHeader
          title="없는 화면입니다"
          description="메뉴에서 다시 고르거나 화면 블록 목록에서 찾으세요"
        />
      </div>
    );
  return (
    <Boundary id={id}>
      <Suspense
        fallback={
          <div className="tl-demo-loading">
            <Spinner size={24} label={`${meta.title} 불러오는 중`} />
          </div>
        }
      >
        <Screen />
      </Suspense>
    </Boundary>
  );
}
