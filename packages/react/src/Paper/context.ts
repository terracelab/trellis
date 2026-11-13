// PaperPreview가 안의 Paper에게 주는 통로. Paper가 넘침을 알리면 미리보기가 줄이지 않은 글자로 안내한다.
// Paper.tsx와 PaperPreview.tsx가 서로를 가져오지 않도록 따로 둔다.
import { createContext } from 'react';

export interface PaperPreviewContextValue {
  /** key = Paper마다 다른 값(useId), label = 쪽 이름. overflow=false면 목록에서 뺀다 */
  report: (key: string, label: string, overflow: boolean) => void;
}

export const PaperPreviewContext = createContext<PaperPreviewContextValue | null>(null);
