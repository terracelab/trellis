// CSS 순서가 중요하다: 글꼴 → 토큰 → 서비스 테마(토큰을 덮는다) → 컴포넌트 → 블록 → 앱. pnpm ds:doctor가 확인한다
import '@terracelab/trellis-tokens/fonts.css';
import '@terracelab/trellis-tokens/tokens.css';
import './theme.css';
import '@terracelab/trellis-react/styles.css';
import '@terracelab/trellis-blocks/ui.css';
import './app.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
