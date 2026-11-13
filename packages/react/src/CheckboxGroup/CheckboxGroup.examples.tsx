import { useEffect, useState } from 'react';
import { Field } from '../Field/Field.js';
import { CheckboxGroup } from './CheckboxGroup.js';

const INSURANCE = [
  { value: 'pension', label: '국민연금' },
  { value: 'health', label: '건강보험' },
  { value: 'employment', label: '고용보험' },
  { value: 'accident', label: '산재보험' },
];

/** 4대보험 취득 대상 — Field 라벨 · 필수 · 도움말이 묶음에 이어진다 */
export function Vertical() {
  return (
    <Field label="4대보험 취득 대상" required help="취득 신고를 할 보험을 고릅니다">
      <CheckboxGroup
        options={INSURANCE}
        defaultValue={['pension', 'health', 'employment']}
        name="insurance"
      />
    </Field>
  );
}

/** 가로 배치 — 짧은 라벨은 나란히 놓고 줄이 차면 넘긴다 */
export function Horizontal() {
  return (
    <Field label="중량">
      <CheckboxGroup
        orientation="horizontal"
        defaultValue={['1kg', '2kg']}
        options={['500g', '1kg', '2kg', '5kg', '10kg'].map((w) => ({ value: w, label: w }))}
      />
    </Field>
  );
}

/** 색 점 범례 — 캘린더 표시처럼 라벨 앞에 범주 색 점(color). 색은 점뿐이고 뜻은 라벨이 말한다 */
export function ColorDots() {
  return (
    <CheckboxGroup
      label="캘린더"
      orientation="horizontal"
      defaultValue={['mine', 'team', 'company', 'leave']}
      options={[
        { value: 'mine', label: '내 일정', color: 'series-1' },
        { value: 'team', label: '팀', color: 'series-2' },
        { value: 'company', label: '회사', color: 'series-3' },
        { value: 'leave', label: '휴가 · 출장', color: 'series-4' },
        { value: 'deadline', label: '마감', color: 'series-5' },
      ]}
    />
  );
}

/** 전체 선택 — selectAll에 라벨을 주면 맨 위에 생기고, 일부만 고르면 가운데 줄로 보인다 */
export function SelectAll() {
  const [value, setValue] = useState<string[]>(['hq']);
  return (
    <Field label="법인 범위" help="초대한 사용자가 볼 수 있는 법인입니다">
      <CheckboxGroup
        selectAll="법인 전체"
        value={value}
        onChange={setValue}
        options={[
          { value: 'hq', label: '테라트레이딩 본사' },
          { value: 'busan', label: '테라트레이딩 부산지사' },
          { value: 'food', label: '테라푸드' },
        ]}
      />
    </Field>
  );
}

/** 설명 — 선택지마다 라벨 아래 한 줄 설명을 둔다 */
export function Descriptions() {
  return (
    <Field label="퇴사 처리">
      <CheckboxGroup
        defaultValue={['account']}
        options={[
          { value: 'account', label: '계정 잠금', description: '퇴사일 18:00에 로그인을 막습니다' },
          { value: 'assets', label: '지급 자산 회수', description: '노트북 1대 · 출입증 1장' },
          {
            value: 'payroll',
            label: '퇴직금 정산',
            description: '마지막 급여일에 함께 지급합니다',
          },
          {
            value: 'insurance',
            label: '4대보험 상실 신고',
            description: '퇴사 다음 달 15일까지',
            disabled: true,
          },
        ]}
      />
    </Field>
  );
}

/** 오류 — Field error가 있으면 상자마다 오류 테두리와 aria-invalid가 붙는다 */
export function WithError() {
  return (
    <Field label="판매 채널" required error="채널을 하나 이상 고르세요">
      <CheckboxGroup
        orientation="horizontal"
        options={[
          { value: 'mall', label: '자사몰' },
          { value: 'open', label: '오픈마켓' },
          { value: 'social', label: '소셜 커머스' },
        ]}
      />
    </Field>
  );
}

/** 더 보기 — 선택지가 많으면 처음 몇 개만 보이고 나머지는 펼친다 */
export function MaxVisible() {
  return (
    <CheckboxGroup
      label="창고"
      maxVisible={4}
      defaultValue={['seoul']}
      options={[
        { value: 'seoul', label: '서울 본사 창고' },
        { value: 'yongin', label: '용인 물류센터' },
        { value: 'busan', label: '부산 냉동창고' },
        { value: 'incheon', label: '인천 보세창고' },
        { value: 'pyeongtaek', label: '평택항 창고' },
        { value: 'daejeon', label: '대전 물류센터' },
        { value: 'gwangju', label: '광주 물류센터' },
      ]}
    />
  );
}

/** 줄 끝 정보 — meta에 건수 · 링크를 둔다. 라벨 밖이라 링크를 눌러도 상자는 바뀌지 않는다 */
export function WithMeta() {
  return (
    <Field label="캘린더 표시">
      <CheckboxGroup
        defaultValue={['mine', 'team']}
        options={[
          { value: 'mine', label: '내 일정', meta: '12건' },
          { value: 'team', label: '영업팀', meta: '34건' },
          { value: 'holiday', label: '공휴일', meta: '3건' },
          {
            value: 'shared',
            label: '공유받은 캘린더',
            meta: <a href="#calendar-settings">설정</a>,
          },
        ]}
      />
    </Field>
  );
}

/** 바로 저장 — onChange 둘째 인자로 바뀐 선택지만 저장하고, 저장하는 동안 pending에 넣어 Spinner를 보이고 누를 수 없게 한다 */
export function ImmediateSave() {
  const [value, setValue] = useState<string[]>(['email', 'app']);
  const [pending, setPending] = useState<string[]>(['sms']);
  // 서버 저장 대신 1초 기다린다. 처음 보일 때는 문자가 저장 중이다
  useEffect(() => {
    const timer = window.setTimeout(() => setPending((p) => p.filter((v) => v !== 'sms')), 1000);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <Field label="결재 알림 받기" help="바꾸면 바로 저장합니다">
      <CheckboxGroup
        value={value}
        pending={pending}
        onChange={(next, change) => {
          setValue(next);
          setPending((p) => [...p, ...change.values]);
          window.setTimeout(
            () => setPending((p) => p.filter((v) => !change.values.includes(v))),
            1000,
          );
        }}
        options={[
          { value: 'email', label: '이메일' },
          { value: 'app', label: '앱 알림' },
          { value: 'sms', label: '문자' },
        ]}
      />
    </Field>
  );
}
