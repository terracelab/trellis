// 플랫폼 기본 · 로그인: 회사 코드 · 아이디 · 비밀번호 → 2단계 인증 → 홈. 고객사 로고 자리는 brand 슬롯
import {
  Banner,
  Button,
  Card,
  Checkbox,
  Field,
  Input,
  MaskedInput,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import {
  COMPANY,
  linkTarget,
  useOpenLink,
  useScreenParams,
  useScreens,
} from '../../../_platform/index.js';
import './style.css';

// slot:home — 인증이 끝나면 갈 화면(블록 id)
const HOME = 'home/dashboard/trade';
// slot:home end

/** 로그인 뒤로 돌아가지 않는 화면: 로그인 자신과 오류 화면(다시 만료 · 권한 없음으로 돌아가지 않게) */
const NO_RETURN = /^platform\/(auth|errors)\//;

export default function Login() {
  const screens = useScreens();
  const openLink = useOpenLink();
  // 보던 화면(?next=블록 id 또는 '블록 id?k=v', 로그인 만료 화면이 넘긴다). 블록 id만 받으니 바깥 주소로 가지 않는다
  const { next } = useScreenParams();
  const back = next && !NO_RETURN.test(linkTarget(next).id) ? openLink(next) : undefined;
  const [step, setStep] = useState<'password' | 'mfa'>('password');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="tl-block-auth">
      <section className="tl-block-auth__brand" aria-label="회사">
        <span className="tl-block-auth__logo">{COMPANY.name}</span>
        <h1 className="tl-block-auth__title">업무 시스템</h1>
        <p className="tl-block-auth__lead">
          세금계산서 · 발주 · 입고 · 재고 · 거래처 원장을 한 계정으로 씁니다.
        </p>
        <p className="tl-block-auth__foot">테라스원 맞춤 구축 · Trellis 디자인 시스템</p>
      </section>
      <section className="tl-block-auth__panel">
        <Card
          title={step === 'password' ? '로그인' : '2단계 인증'}
          subtitle={
            step === 'password'
              ? '회사 코드는 관리자에게 받습니다'
              : '인증 앱에 표시된 6자리 숫자를 입력하세요'
          }
        >
          {step === 'password' ? (
            <form
              className="tl-block-auth__form"
              onSubmit={(e) => {
                e.preventDefault();
                setStep('mfa');
              }}
            >
              <Field label="회사 코드" required>
                <Input defaultValue="terra-trading" autoComplete="organization" />
              </Field>
              <Field label="아이디" required>
                <Input defaultValue="terra.kim" autoComplete="username" />
              </Field>
              <Field label="비밀번호" required>
                <Input
                  type="password"
                  defaultValue="demo-password"
                  autoComplete="current-password"
                />
              </Field>
              <Checkbox defaultChecked>로그인 상태 유지(이 기기에서 14일)</Checkbox>
              <Button type="submit" variant="primary" size="lg" fullWidth>
                로그인
              </Button>
              <div className="tl-block-auth__sso">
                <Button fullWidth icon="building-2">
                  회사 계정(SSO)으로 로그인
                </Button>
              </div>
              <a className="tl-block-auth__link" href="#/platform/auth/login">
                비밀번호를 잊었습니다
              </a>
            </form>
          ) : (
            <form
              className="tl-block-auth__form"
              onSubmit={(e) => {
                e.preventDefault();
                if (code.length !== 6) return setError('6자리 숫자를 모두 입력하세요');
                // 인증이 끝나면 보던 화면, 없으면 홈(앱이 넘긴 화면 이동, 브라우저 라우터에서도 동작)
                if (back) back();
                else screens.go(HOME);
              }}
            >
              {error && <Banner tone="danger">{error}</Banner>}
              <Field label="인증 코드" required help="30초마다 바뀝니다. 남은 시간 18초">
                <MaskedInput
                  mask="######"
                  value={code}
                  onChange={(raw) => setCode(raw)}
                  placeholder="123456"
                />
              </Field>
              <Button type="submit" variant="primary" size="lg" fullWidth>
                확인
              </Button>
              <Button variant="ghost" fullWidth onPress={() => setStep('password')}>
                다른 계정으로 로그인
              </Button>
            </form>
          )}
        </Card>
      </section>
    </div>
  );
}
