// 인사 마스터(ListDetail): 왼쪽 사원 목록 → 오른쪽 프로필 머리 + 인사기록카드(항목 이동 줄).
// 주민등록번호 뒷자리 · 급여 계좌는 가려 두고, 인사 권한(hr-payroll update)이 있을 때만 "가린 정보 보기"가 생긴다.
// 열람은 플랫폼 감사 기록에 남긴다(데모는 알림만).
// 목록은 데이터 범위(Role.scope) 안의 사람만: 팀장 = 자기 부서, 구성원 = 자기 카드 한 장(목록 열 없이).
// 주소 ?id=<사번>으로 처음 볼 사람을 고른다(사원 목록 · 조직도에서 열 때).
import { HR_RECORD_SECTIONS, type HrRecordSection } from '@terracelab/trellis-contracts';
import {
  Button,
  Card,
  EmptyState,
  HrRecord,
  Input,
  PageHeader,
  ProfileHeader,
  Select,
  SelectableList,
  useToast,
} from '@terracelab/trellis-react';
import { useEffect, useState } from 'react';
import { EMPLOYMENT_STATES, employeeByName } from '../../../_data/erp.js';
import { HR_PEOPLE, hrRecordOf, metaOf, PRESENCE, statusOf, typeOf } from '../../../_data/hr.js';
import { TODAY } from '../../../_data/index.js';
import { useCan, usePlatform, useScope, useScreenParams } from '../../../_platform/index.js';
import { Page, useSiblings, type SiblingScreen } from '../../../_ui/index.js';
import './style.css';

const ID = 'erp/hr-payroll/hr-master';

// slot: siblings — 제목 줄 탭(같은 묶음 화면). 라벨은 그 화면의 PageHeader title과 같게. 앱에 없는 화면은 빠진다
const SIBLINGS: readonly SiblingScreen[] = [
  { id: 'erp/hr-payroll/employees', label: '인사 기록' },
  { id: ID, label: '인사 마스터' },
  { id: 'erp/hr-payroll/org-chart', label: '조직도' },
];
// slot: siblings end

// slot: sections — 인사기록카드에 보일 항목 · 순서(회사가 쓰지 않는 병역 · 상벌은 빼도 된다)
const SECTIONS: readonly HrRecordSection[] = HR_RECORD_SECTIONS;
// slot: sections end

export default function HrMaster() {
  const toast = useToast();
  const { session } = usePlatform();
  const { canSee } = useScope();
  const { id: paramId } = useScreenParams();
  const titleTabs = useSiblings(ID, SIBLINGS);

  // slot: people — 볼 수 있는 사람(데이터 범위 안). 서비스는 API 목록으로 바꾼다
  const people = HR_PEOPLE.filter((e) => canSee({ name: e.name, department: e.department }));
  const mine = employeeByName(session.user.name)?.id;
  const firstId = (people.find((e) => e.id === mine) ?? people[0])?.id ?? '';
  // slot: people end

  // slot: reveal — 가린 정보(주민등록번호 뒷자리 · 계좌)를 여는 권한과 열람 기록
  const canReveal = useCan('hr-payroll', 'update');
  const [revealed, setRevealed] = useState(false);
  const reveal = (on: boolean, name: string) => {
    setRevealed(on);
    if (on)
      toast.show({
        title: `${name}의 가린 정보를 열었습니다`,
        description: `${session.user.name} · 열람 기록을 남겼습니다`,
        tone: 'info',
      });
  };
  // slot: reveal end

  const [q, setQ] = useState('');
  const [id, setId] = useState<string>(() => paramId ?? firstId);
  // 주소의 사람이 바뀌면(다른 화면에서 카드 열기 · 뒤로) 따라가고 다시 가린다
  useEffect(() => {
    if (!paramId) return;
    setId(paramId);
    setRevealed(false);
  }, [paramId]);

  const shown = people.filter((e) => !q || `${e.name}${e.id}${e.department}${e.title}`.includes(q));
  // 범위 밖 사람(주소로 들어온 남의 카드)은 열지 않는다
  const person = people.find((e) => e.id === id) ?? people.find((e) => e.id === firstId);
  const single = people.length === 1;
  const active = people.filter((e) => e.status === 'active').length;
  const onLeave = people.filter((e) => e.status === 'leave').length;

  const pick = (next: string) => {
    setId(next);
    // 다른 사람을 고르면 다시 가린다
    setRevealed(false);
  };

  const header = (
    <PageHeader
      breadcrumbs={[{ label: '인사·급여' }, { label: '인사 마스터' }]}
      title="인사 마스터"
      {...titleTabs}
      description={
        single
          ? `${person?.name ?? ''} 인사기록카드`
          : `재직 ${active}명 · 휴직 ${onLeave}명 · 인사기록카드 ${people.length}장`
      }
      actions={
        <>
          <Button icon="printer" disabled={!person}>
            인사기록카드 인쇄
          </Button>
          <Button variant="primary" icon="pencil" disabled={!canReveal || !person}>
            정보 수정
          </Button>
        </>
      }
    />
  );

  if (!person)
    return (
      <Page header={header}>
        <Card>
          <EmptyState
            kind="forbidden"
            title="볼 수 있는 인사기록카드가 없습니다"
            description="인사 담당에게 계정과 사원 연결을 요청하세요"
          />
        </Card>
      </Page>
    );

  const record = hrRecordOf(person);
  return (
    <Page header={header}>
      <div className="tl-block-hrm" data-single={single || undefined}>
        {!single && (
          <>
            <aside className="tl-block-hrm__people" aria-label="사원 목록">
              <Input
                type="search"
                icon="search"
                size="sm"
                label="사원 검색"
                placeholder="이름 · 사번 · 부서"
                value={q}
                onChange={setQ}
                clearable
              />
              <SelectableList
                label="사원"
                items={shown.map((e) => ({
                  id: e.id,
                  title: e.name,
                  avatar: { name: e.name },
                  secondary:
                    e.status === 'active'
                      ? metaOf(e)
                      : `${metaOf(e)} · ${EMPLOYMENT_STATES[e.status].label}`,
                  ...(PRESENCE[e.id] ? { presence: PRESENCE[e.id] } : {}),
                }))}
                selected={person.id}
                onSelect={pick}
                emptyText="찾는 사원이 없습니다. 이름 · 사번 · 부서를 다시 확인하세요"
              />
            </aside>
            {/* 좁은 화면: 목록 대신 고르기 칸 */}
            <div className="tl-block-hrm__picker">
              <Select
                label="사원"
                value={person.id}
                onChange={(v) => v && pick(v)}
                options={people.map((e) => ({ value: e.id, label: `${e.name} · ${metaOf(e)}` }))}
              />
            </div>
          </>
        )}
        <section className="tl-block-hrm__card" aria-label={`${person.name} 인사기록카드`}>
          <ProfileHeader
            name={person.name}
            {...(record.personal.nameEn ? { nameEn: record.personal.nameEn } : {})}
            {...(record.personal.nameHanja ? { nameHanja: record.personal.nameHanja } : {})}
            department={person.department}
            position={record.employment.position ?? person.title}
            {...(record.employment.role ? { role: record.employment.role } : {})}
            status={statusOf(person)}
            {...(PRESENCE[person.id] ? { presence: PRESENCE[person.id] } : {})}
            employeeNo={person.id}
            hireDate={person.hiredAt}
            employmentType={typeOf(person)}
            today={record.employment.resignDate ?? TODAY}
            actions={
              <Button icon="file-text" disabled={person.status === 'retired'}>
                재직증명서
              </Button>
            }
          />
          <HrRecord
            record={record}
            sections={SECTIONS}
            today={TODAY}
            headingLevel={3}
            revealed={canReveal && revealed}
            {...(canReveal ? { onRevealChange: (on: boolean) => reveal(on, person.name) } : {})}
          />
          {!canReveal && (
            <p className="tl-block-hrm__note">
              주민등록번호 뒷자리와 급여 계좌는 인사 권한이 있을 때만 볼 수 있습니다
            </p>
          )}
        </section>
      </div>
    </Page>
  );
}
