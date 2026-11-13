import { Button } from '../Button/Button.js';
import { ProfileHeader } from './ProfileHeader.js';

/** 구성원 상세 — 이름 · 재직 상태 · 오늘 근무, 소속 줄, 사번 · 입사일 · 근속 · 고용 형태 */
export function Member() {
  return (
    <ProfileHeader
      name="한서연"
      nameEn="Seoyeon Han"
      department="인사팀"
      role="파트장"
      position="매니저"
      grade="G4"
      status="active"
      presence="working"
      employeeNo="E-0012"
      hireDate="2022-03-02"
      employmentType="regular"
      today="2026-11-06"
      actions={
        <>
          <Button icon="pencil">정보 수정</Button>
          <Button variant="primary" icon="file-text">
            증명서 발급
          </Button>
        </>
      }
    />
  );
}

/** 휴직 중 계약직 — 상태는 Badge 하나, 더 붙일 요약은 facts */
export function OnLeave() {
  return (
    <ProfileHeader
      name="오하늘"
      nameHanja="吳하늘"
      department="플랫폼팀"
      position="선임"
      status="leave"
      employeeNo="E-0047"
      hireDate="2024-01-08"
      employmentType="contract"
      today="2026-11-06"
      facts={[{ label: '복직 예정일', value: '2027-02-01' }]}
    />
  );
}
