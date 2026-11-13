import '@terracelab/trellis-tokens/fonts.css';
import '@terracelab/trellis-tokens/tokens.css';
import '@terracelab/trellis-react/styles.css';
import '@terracelab/trellis-blocks/ui.css';
import './styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
