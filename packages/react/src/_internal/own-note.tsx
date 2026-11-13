// Field 밖 입력 부품이 스스로 찾은 오류 문구(useFieldMessage가 false일 때). 모양은 Field 오류 칸과 같다.
// Field 안이면 이 문구 대신 Field 오류 칸에 올린다.
import { Icon } from '../Icon/Icon.js';

export function OwnErrorNote({ id, message }: { id: string; message: string }) {
  return (
    <span className="tl-field__note" id={id} data-kind="error" role="alert">
      <Icon name="circle-alert" className="tl-field__note-icon" />
      {message}
    </span>
  );
}
