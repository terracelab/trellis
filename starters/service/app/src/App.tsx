import { PlatformProvider } from '@terracelab/trellis-blocks/platform';
import { ToastProvider, TooltipProvider } from '@terracelab/trellis-react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Home } from './pages/Home.js';
import { NotFound } from './pages/NotFound.js';
import { Settings } from './pages/Settings.js';
import { useServicePlatform } from './platform.js';
import { screenHref, screenIds } from './screens.js';
import { Shell } from './Shell.js';

const router = createBrowserRouter([
  {
    element: <Shell />,
    children: [
      { index: true, element: <Home /> },
      { path: 'settings', element: <Settings /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export function App() {
  const platform = useServicePlatform();
  return (
    <PlatformProvider
      {...platform}
      // 블록 화면 이동: 화면 id → 앱 주소(screens.ts), 라우터로 이동(새로 고침 없음)
      screens={screenIds}
      screenHref={screenHref}
      navigate={(id, params) => void router.navigate(screenHref(id, params))}
    >
      <TooltipProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </TooltipProvider>
    </PlatformProvider>
  );
}
