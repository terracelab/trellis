import { formatRrn, maskAccount, maskAddress, maskPhone } from '@terracelab/trellis-contracts';
import { DescriptionList } from '../DescriptionList/DescriptionList.js';
import { MaskedValue } from './MaskedValue.js';

/** 주민등록번호 — 보기를 누르면 사유를 받고, 60초 동안 원문을 보인 뒤 다시 가린다 */
export function Resident() {
  return (
    <MaskedValue
      label="주민등록번호"
      value={formatRrn('9204152345678')}
      onReveal={async () => formatRrn('9204152345678', { masked: false })}
    />
  );
}

/** 권한 없음 — 보기 단추 대신 자물쇠와 이유 */
export function Locked() {
  return (
    <MaskedValue
      label="계좌번호"
      value={`국민은행 ${maskAccount('482-21-0193-847')}`}
      canReveal={false}
      lockedReason="급여 담당자만 봅니다"
    />
  );
}

/** 설명 목록 안 — 계좌번호는 끝 네 자리만, 원문이 보이는 동안 복사할 수 있다 */
export function InRecord() {
  return (
    <DescriptionList
      items={[
        { label: '성명', value: '한서연' },
        {
          label: '휴대전화',
          value: (
            <MaskedValue
              label="휴대전화"
              value={maskPhone('010-2231-7780')}
              onReveal={async () => '010-2231-7780'}
              copyable
            />
          ),
        },
        {
          label: '급여 계좌',
          value: (
            <MaskedValue
              label="급여 계좌"
              value={`국민은행 ${maskAccount('482-21-0193-847')}`}
              onReveal={async () => '국민은행 482-21-0193-847'}
              revealSeconds={30}
              copyable
            />
          ),
        },
        {
          label: '주소',
          value: (
            <MaskedValue
              label="주소"
              value={maskAddress('서울특별시 강남구 테헤란로 152 강남파이낸스센터 4층')}
              onReveal={async () => '서울특별시 강남구 테헤란로 152 강남파이낸스센터 4층'}
            />
          ),
          span: 2,
        },
      ]}
    />
  );
}

/** 상태 — onReveal이 없으면 읽기 전용, 잠김, 원문을 불러오지 못하면 대화 상자에 오류가 남는다 */
export function States() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-12)', justifyItems: 'start' }}>
      <MaskedValue label="주민등록번호" value={formatRrn('9204152345678')} />
      <MaskedValue label="주민등록번호" value={formatRrn('9204152345678')} canReveal={false} />
      <MaskedValue
        label="주민등록번호"
        value={formatRrn('9204152345678')}
        onReveal={() => Promise.reject(new Error('forbidden'))}
      />
    </div>
  );
}
