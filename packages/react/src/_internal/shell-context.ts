// AppShell이 사이드바 안에 알려 주는 것(R-41). SideNav는 collapsed prop이 없으면 이 값을 따른다.
// AppShell 밖이면 undefined라 SideNav는 지금처럼 펼친 모양이다.
import { createContext } from 'react';

/** 틀의 사이드바가 접혔는지(넓은 화면에서만 true. 1024 미만 덮개는 늘 펼친다) */
export const ShellSidebarCollapsedContext = createContext<boolean | undefined>(undefined);
