import { PlatformProvider } from '@terracelab/trellis-blocks/platform';
import { ToastProvider, TooltipProvider, TrellisProvider } from '@terracelab/trellis-react';
import { useState } from 'react';
import { BlockPage } from './pages/BlockPage.js';
import { Catalog } from './pages/Catalog.js';
import { PRESETS } from './presets.js';
import { useRoute } from './router.js';
import { a11yProps, useA11y } from './settings.js';
import { Shell } from './Shell.js';
import { blockById, SCREEN_IDS } from './registry.js';

export function App() {
  const route = useRoute();
  const [presetId, setPresetId] = useState('trade');
  // 접근성 설정은 TrellisProvider가 <html>의 data-* 속성으로 건다. 틀 없는 화면(로그인)에도 같이 걸린다
  const { a11y, setA11y } = useA11y();
  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0]!;
  const meta = blockById(route);
  // 로그인 같은 전체 화면 블록은 틀 없이. 오류 화면은 ?frame=none으로 틀 밖 모양을 본다(PG-44)
  const bare =
    new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('frame') === 'none';
  if (meta?.pattern === 'Auth' || (bare && meta?.pattern === 'ErrorPage'))
    return (
      <TrellisProvider {...a11yProps(a11y)}>
        <PlatformProvider screens={SCREEN_IDS}>
          <ToastProvider>
            <BlockPage id={route} />
          </ToastProvider>
        </PlatformProvider>
      </TrellisProvider>
    );
  const page = !route ? preset.home : route;
  return (
    <TrellisProvider {...a11yProps(a11y)}>
      <PlatformProvider screens={SCREEN_IDS}>
        <TooltipProvider>
          <ToastProvider>
            <Shell route={page} preset={preset} onPreset={setPresetId} a11y={a11y} onA11y={setA11y}>
              {page === 'blocks' ? <Catalog /> : <BlockPage id={page} />}
            </Shell>
          </ToastProvider>
        </TooltipProvider>
      </PlatformProvider>
    </TrellisProvider>
  );
}
