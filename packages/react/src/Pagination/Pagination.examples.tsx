import { Pagination } from './Pagination.js';

/** 목록 아래 — 총 건수 · 번호 7칸 · 페이지 크기. 페이지 상태는 화면이 들고 있다 */
export function Default() {
  return (
    <Pagination
      page={5}
      total={1240}
      pageSize={20}
      pageSizeOptions={[20, 50, 100]}
      onPageChange={() => {}}
      onPageSizeChange={() => {}}
    />
  );
}

/** 페이지가 적을 때 — 생략 없이 전부 보인다 */
export function Few() {
  return <Pagination page={2} pageCount={4} showTotal={false} onPageChange={() => {}} />;
}

/** 불러오는 중 — 버튼을 모두 막는다 */
export function Disabled() {
  return <Pagination page={61} total={1240} disabled onPageChange={() => {}} />;
}
