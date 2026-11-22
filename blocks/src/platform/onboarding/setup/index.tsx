// 플랫폼 기본 · 처음 설정(FormRegister): 회사를 처음 등록할 때 회사 → 사람 → 자료 → 에이전트 → 확인 순서로 넣는다.
// 단계 구조는 platform/import/excel과 같다(Stepper + 단계 내용 + 아래 고정 동작 줄). 단계마다 "다음" · "나중에".
// 서류에서 읽은 값은 ProposalCard로 보이고 승인해야 칸에 들어간다. 직원 엑셀은 줄마다 검사하고 통과한 줄만 센다.
// 마지막 단계의 기한은 기한 규칙과 앞 단계 값(결산월 · 직원 수 · 세액감면)으로 계산한다(_data/onboarding.ts).
import { formatBizNo, formatDate, type StepperStep } from '@terracelab/trellis-contracts';
import {
  ActionBar,
  Badge,
  Banner,
  Button,
  Card,
  Checklist,
  DataGrid,
  DateField,
  DescriptionList,
  Field,
  FileUpload,
  FormSection,
  Input,
  IssueList,
  MaskedInput,
  PageHeader,
  ProposalCard,
  Select,
  SelectableCard,
  Stepper,
  Switch,
  useBreakpoint,
  useToast,
} from '@terracelab/trellis-react';
import modules from '@terracelab/trellis-tokens/modules';
import { useState } from 'react';
import {
  AGENT_CHOICES,
  deadlinesFor,
  EMPTY_SETUP,
  PEOPLE_FILE,
  PERSON_ROLES,
  READ_FROM_DOCS,
  roleName,
  ruleOf,
  SAMPLE_DOC_FILES,
  SAMPLE_PEOPLE,
  suggestAgents,
  UPLOAD_KINDS,
  type OnboardingPerson,
  type OnboardingSetup,
} from '../../../_data/onboarding.js';
import { TODAY } from '../../../_data/trade.js';
import { usePlatform, useScreens } from '../../../_platform/index.js';
import { Page, Stack } from '../../../_ui/index.js';

// slot: steps — 단계 이름과 순서. 단계 내용은 아래 step 번호로 고른다
const STEPS = ['회사', '사람', '자료', '에이전트', '확인'] as const;
const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1}월`,
}));
const DAYS = Array.from({ length: 28 }, (_, i) => ({
  value: String(i + 1),
  label: `매월 ${i + 1}일`,
}));
// 마치면 여는 화면(블록 id). 앱에 없으면 이 화면에 남아 마친 표시를 보인다
const AFTER_START = 'home/launcher/modules';
// slot: steps end

const DOC_FIELDS: readonly { key: keyof typeof READ_FROM_DOCS; label: string }[] = [
  { key: 'name', label: '상호' },
  { key: 'bizNo', label: '사업자등록번호' },
  { key: 'ceo', label: '대표' },
  { key: 'address', label: '본점 주소' },
  { key: 'industry', label: '업종' },
  { key: 'foundedAt', label: '설립일' },
];

type DocProposal = 'none' | 'waiting' | 'approved' | 'rejected';
/** 제안 표의 값 글자: 등록번호 · 날짜는 서식을 입힌다 */
const docText = (key: keyof typeof READ_FROM_DOCS, value: string | undefined) =>
  !value
    ? null
    : key === 'bizNo'
      ? formatBizNo(value)
      : key === 'foundedAt'
        ? formatDate(value)
        : value;

export default function OnboardingSetup() {
  const toast = useToast();
  const screens = useScreens();
  const { company } = usePlatform().session;
  const phone = useBreakpoint() === 'base';
  const [step, setStep] = useState(0);
  const [skipped, setSkipped] = useState<readonly number[]>([]);
  const [setup, setSetup] = useState<OnboardingSetup>(EMPTY_SETUP);
  const [proposal, setProposal] = useState<DocProposal>('none');
  // 제안을 띄운 때의 칸 값(바뀌기 전). 승인한 뒤에도 무엇에서 바뀌었는지 보인다
  const [docBefore, setDocBefore] = useState<Partial<OnboardingSetup>>({});
  const [docs, setDocs] = useState<{ name: string; size: number }[]>([]);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<string | null>(PERSON_ROLES[0]?.value ?? null);
  const [done, setDone] = useState(false);

  const patch = (next: Partial<OnboardingSetup>) => setSetup((s) => ({ ...s, ...next }));
  const employees = setup.people.filter((p) => !p.error).length;
  const deadlines = deadlinesFor(setup);

  const go = (next: number) => {
    // 에이전트 단계에 처음 들어오면 앞 단계 답으로 미리 고른다
    if (next === 3 && setup.agents.length === 0) patch({ agents: suggestAgents(employees) });
    setStep(next);
  };
  const propose = () => {
    setDocBefore(Object.fromEntries(DOC_FIELDS.map((f) => [f.key, setup[f.key]])));
    setProposal('waiting');
  };
  const later = () => {
    setSkipped((s) => [...new Set([...s, step])]);
    go(step + 1);
  };
  const setPeople = (people: readonly OnboardingPerson[]) => patch({ people });

  // slot: deadlines — 처음 할 일: 기한 + 나중에로 넘긴 단계 마저 넣기
  const firstTasks = [
    ...deadlines.map((d) => ({
      id: d.id,
      title: d.title,
      due: d.due,
      owner: d.owner,
      law: ruleOf(d.ruleKey)?.law,
    })),
    ...skipped
      .filter((i) => i < 3)
      .map((i) => ({
        id: `later-${i}`,
        title: `처음 설정 · ${STEPS[i]} 마저 넣기`,
        due: TODAY,
        owner: 'admin' as const,
        law: undefined,
      })),
  ];
  // slot: deadlines end

  // 켜지는 메뉴: 회사의 모듈(맞춤 구축 범위)을 묶음마다
  const menuRows = Object.entries(modules.groups)
    .map(([gid, g]) => ({
      label: g.label,
      value: modules.modules
        .filter((m) => m.group === gid && company.modules.includes(m.id))
        .map((m) => m.label)
        .join(' · '),
    }))
    .filter((r) => r.value);
  const agentNames = AGENT_CHOICES.filter((a) => setup.agents.includes(a.id)).map((a) => a.name);

  const start = () => {
    setDone(true);
    toast.show({
      title: '처음 설정을 마쳤습니다',
      description: `첫 할 일 ${firstTasks.length}건 · 에이전트 ${setup.agents.length}개를 켰습니다`,
      tone: 'success',
    });
    if (screens.has(AFTER_START)) screens.go(AFTER_START);
  };
  const restart = () => {
    setDone(false);
    setStep(0);
    setSkipped([]);
    setProposal('none');
    setDocBefore({});
    setDocs([]);
    setSetup(EMPTY_SETUP);
  };

  const step1Missing = !setup.name || setup.bizNo.length !== 10;

  const steps: StepperStep[] = STEPS.map((label, i) => ({
    id: String(i),
    label,
    state: done || i < step ? 'done' : i === step ? 'current' : 'todo',
    ...(!phone && skipped.includes(i) && i < step ? { description: '나중에' } : {}),
  }));

  return (
    <Page
      width="form"
      header={
        <PageHeader
          breadcrumbs={[{ label: '관리' }, { label: '처음 설정' }]}
          title="처음 설정"
          description="회사에 맞게 메뉴 · 기한 · 에이전트를 켭니다. 단계마다 나중에로 넘길 수 있습니다"
        />
      }
    >
      {done && (
        <Banner
          tone="success"
          title="처음 설정을 마쳤습니다"
          action={
            <Button size="sm" onPress={restart}>
              다시 시작
            </Button>
          }
        >
          바꿀 값은 회사 설정에서 고칩니다. 다시 시작하면 빈 칸에서 시작합니다.
        </Banner>
      )}
      <Card>
        <Stepper steps={steps} label="처음 설정 단계" />
      </Card>

      {step === 0 && (
        <Stack>
          <Card
            title="사업자등록증 · 등기부"
            subtitle="PDF를 올리면 상호 · 등록번호 · 대표 · 주소 · 업종 · 설립일을 읽어 제안합니다. 손으로 넣어도 됩니다"
          >
            <FileUpload
              accept=".pdf"
              multiple
              files={docs.map((d) => ({ ...d, status: 'done' as const }))}
              onFilesChange={(files) => {
                setDocs(files.map((f) => ({ name: f.name, size: f.size })));
                if (files.length) propose();
              }}
              onRemove={(name) => setDocs((d) => d.filter((x) => x.name !== name))}
              hint="PDF · 한 파일 20MB까지"
            />
            {docs.length === 0 && (
              <Button
                variant="ghost"
                size="sm"
                icon="file-text"
                onPress={() => {
                  setDocs(SAMPLE_DOC_FILES.map((name) => ({ name, size: 248_320 })));
                  propose();
                }}
              >
                예시 서류로 해 보기
              </Button>
            )}
          </Card>
          {proposal !== 'none' && (
            <ProposalCard
              headingLevel={2}
              title="서류에서 읽은 회사 정보"
              summary="승인하면 아래 칸에 넣습니다. 승인 전에는 저장하지 않습니다"
              changes={DOC_FIELDS.map((f) => ({
                field: f.label,
                before: docText(f.key, docBefore[f.key] as string | undefined),
                after: docText(f.key, READ_FROM_DOCS[f.key]),
              }))}
              status={proposal}
              approveLabel="칸에 넣기"
              onApprove={() => {
                patch(READ_FROM_DOCS);
                setProposal('approved');
              }}
              onReject={() => setProposal('rejected')}
            />
          )}
          <Card title="회사 정보">
            <FormSection columns={2}>
              <Field label="상호" required>
                <Input value={setup.name} onChange={(v) => patch({ name: v })} />
              </Field>
              <Field label="사업자등록번호" required>
                <MaskedInput
                  mask="bizNo"
                  value={setup.bizNo}
                  onChange={(raw) => patch({ bizNo: raw })}
                  validate
                />
              </Field>
              <Field label="대표">
                <Input value={setup.ceo} onChange={(v) => patch({ ceo: v })} />
              </Field>
              <Field label="설립일">
                <DateField
                  value={setup.foundedAt || null}
                  onChange={(v) => patch({ foundedAt: v ?? '' })}
                  today={TODAY}
                />
              </Field>
              <Field label="본점 주소" span={2}>
                <Input value={setup.address} onChange={(v) => patch({ address: v })} />
              </Field>
              <Field label="업종" span={2}>
                <Input value={setup.industry} onChange={(v) => patch({ industry: v })} />
              </Field>
            </FormSection>
            <FormSection title="운영 기준" columns={2}>
              <Field label="결산월">
                <Select
                  options={MONTHS}
                  value={String(setup.closingMonth)}
                  onChange={(v) => patch({ closingMonth: Number(v ?? 12) })}
                />
              </Field>
              <Field label="급여일">
                <Select
                  options={DAYS}
                  value={String(setup.payday)}
                  onChange={(v) => patch({ payday: Number(v ?? 25) })}
                />
              </Field>
              <Field label="창업중소기업 세액감면" help="법인세 신고 때 감면 신청서를 함께 냅니다">
                <Switch checked={setup.taxRelief} onChange={(v) => patch({ taxRelief: v })}>
                  적용 중
                </Switch>
              </Field>
            </FormSection>
          </Card>
        </Stack>
      )}

      {step === 1 && (
        <Stack>
          <Card
            title="직원 엑셀"
            subtitle="이름 · 부서 · 입사일 · 역할 칸을 줄마다 검사합니다. 통과한 줄만 들어갑니다"
          >
            <FileUpload
              accept=".xlsx,.csv"
              files={setup.people.length ? [{ ...PEOPLE_FILE, status: 'done' }] : []}
              onFilesChange={(files) => files.length && setPeople(SAMPLE_PEOPLE)}
              onRemove={() => setPeople([])}
              hint="엑셀 · CSV"
            />
          </Card>
          {setup.people.some((p) => p.error) && (
            <IssueList
              title="고칠 줄"
              items={setup.people
                .filter((p) => p.error)
                .map((p) => ({
                  id: p.id,
                  level: 'error' as const,
                  tag: p.name,
                  title: '줄 검사 오류',
                  message: p.error ?? '',
                }))}
            />
          )}
          <DataGrid
            caption={`직원 ${setup.people.length}명 · 통과 ${employees}명`}
            rows={setup.people}
            rowKey="id"
            empty="직원 엑셀을 올리거나 한 명씩 더하세요. 직원이 없으면 나중에로 넘깁니다"
            columns={[
              { key: 'name', header: '이름', width: 'md' },
              { key: 'department', header: '부서', width: 'md' },
              {
                key: 'joinedAt',
                header: '입사일',
                width: 'md',
                render: (p) => (p.joinedAt ? formatDate(p.joinedAt) : '–'),
              },
              { key: 'role', header: '역할', width: 'md', render: (p) => roleName(p.role) },
              {
                key: 'check',
                header: '검사',
                width: 'sm',
                render: (p) =>
                  p.error ? <Badge tone="danger">오류</Badge> : <Badge tone="success">통과</Badge>,
              },
            ]}
          />
          <Card title="한 명씩 더하기">
            <FormSection columns={3}>
              <Field label="이름">
                <Input value={newName} onChange={setNewName} />
              </Field>
              <Field label="역할">
                <Select options={PERSON_ROLES} value={newRole} onChange={setNewRole} />
              </Field>
              <Field label="더하기">
                <Button
                  icon="user-plus"
                  disabled={!newName.trim() || !newRole}
                  disabledReason="이름과 역할을 넣으세요"
                  onPress={() => {
                    setPeople([
                      ...setup.people,
                      {
                        id: `p-new-${setup.people.length + 1}`,
                        name: newName.trim(),
                        department: '',
                        joinedAt: TODAY,
                        role: newRole ?? 'auditor',
                      },
                    ]);
                    setNewName('');
                  }}
                >
                  목록에 더하기
                </Button>
              </Field>
            </FormSection>
          </Card>
        </Stack>
      )}

      {step === 2 && (
        <Card
          title="지난 달 자료"
          subtitle="올리면 거래 분류가 시작됩니다. 건너뛰고 나중에 엑셀 업로드에서 올려도 됩니다"
        >
          <FormSection columns={1}>
            {UPLOAD_KINDS.map((u) => (
              <Field key={u.key} label={u.label} help={u.hint}>
                <FileUpload
                  accept=".xlsx,.csv"
                  files={
                    setup.uploads[u.key]
                      ? [{ name: setup.uploads[u.key] ?? '', size: 52_480, status: 'done' }]
                      : []
                  }
                  onFilesChange={(files) =>
                    files[0] && patch({ uploads: { ...setup.uploads, [u.key]: files[0].name } })
                  }
                  onRemove={() => {
                    const next = { ...setup.uploads };
                    delete next[u.key];
                    patch({ uploads: next });
                  }}
                />
              </Field>
            ))}
          </FormSection>
        </Card>
      )}

      {step === 3 && (
        <Card
          title="에이전트"
          subtitle="앞 단계 답으로 미리 골라 두었습니다. 켠 에이전트의 항목만 홈 브리핑에 올라옵니다"
        >
          {/* slot: agents — 켤 수 있는 에이전트(_data/onboarding.ts AGENT_CHOICES) */}
          <SelectableCard
            label="켤 에이전트"
            mode="multiple"
            columns={phone ? 1 : 2}
            value={[...setup.agents]}
            onChange={(v) => patch({ agents: v })}
            options={AGENT_CHOICES.map((a) => ({
              value: a.id,
              title: a.name,
              description: a.briefs,
              icon: a.icon,
            }))}
          />
          {/* slot: agents end */}
        </Card>
      )}

      {step === 4 && (
        <Stack>
          <Card title="켜지는 메뉴" subtitle="모듈은 회사 설정에서 끄고 켭니다">
            <DescriptionList
              columns={1}
              items={[
                ...menuRows,
                {
                  label: `에이전트 ${agentNames.length}개`,
                  value: agentNames.join(' · ') || '없음',
                },
              ]}
            />
          </Card>
          <Card
            title="첫 할 일"
            subtitle="30일 안의 법정 기한과 나중에로 넘긴 단계입니다. 시작하면 할 일로 만듭니다"
          >
            <Checklist
              label="첫 할 일"
              today={TODAY}
              showProgress={false}
              emptyText="30일 안에 오는 법정 기한이 없습니다"
              items={firstTasks.map((t) => ({
                id: t.id,
                title: t.title,
                state: 'pending' as const,
                due: t.due,
                owner: t.owner === 'ceo' ? '대표' : '경영지원',
                ...(t.law ? { meta: t.law } : {}),
              }))}
            />
          </Card>
        </Stack>
      )}

      <ActionBar sticky align="between" summary={`${step + 1} / ${STEPS.length} · ${STEPS[step]}`}>
        <Button disabled={step === 0} icon="arrow-left" onPress={() => go(step - 1)}>
          이전
        </Button>
        {step < STEPS.length - 1 && <Button onPress={later}>나중에</Button>}
        {step < STEPS.length - 1 ? (
          <Button
            variant="primary"
            iconEnd="arrow-right"
            disabled={step === 0 && step1Missing}
            disabledReason="상호와 사업자등록번호 10자리를 넣으세요. 나중에 넣으려면 나중에를 누르세요"
            onPress={() => go(step + 1)}
          >
            다음
          </Button>
        ) : (
          <Button variant="primary" icon="check" disabled={done} onPress={start}>
            시작
          </Button>
        )}
      </ActionBar>
    </Page>
  );
}
