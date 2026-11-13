// block.json 스키마(D-51). check-blocks.mjs · 동봉 문서 생성기(manifest.blocks, PF-05)가 같이 쓴다.
import { z } from 'zod';

export const PATTERNS = [
  'NotificationHome',
  'Dashboard',
  'ListDetail',
  'FormRegister',
  'ApprovalFlow',
  'ConversationalWork',
  'LedgerEntry',
  'TaxFiling',
  'OrderDetail',
  'WarehouseScan',
  'FloorBoard',
  'InventoryMatrix',
  'Settings',
  'Auth',
  // 화면 하나를 차지하는 오류(주소 없음 · 권한 없음 · 로그인 만료, PG-44). 틀 안 · 밖 어디서나 그린다
  'ErrorPage',
];

export const BlockSchema = z.object({
  id: z.string().regex(/^[a-z]+\/[a-z0-9-]+\/[a-z0-9-]+$/),
  title: z.string().min(2).max(24),
  /** 에이전트가 블록을 고르는 근거. 한 문장 평서(한다체) */
  intent: z.string().min(10).max(120),
  module: z.string(),
  pattern: z.enum(PATTERNS),
  industries: z
    .array(z.enum(['trade', 'distribution', 'commerce', 'manufacturing', 'tax', 'general']))
    .min(1),
  components: z.array(z.string()).min(1),
  sizes: z
    .array(z.union([z.literal(1440), z.literal(1024), z.literal(390), z.literal(1920)]))
    .min(1),
  slots: z.array(z.string()).default([]),
  status: z.enum(['preview', 'stable']).default('preview'),
  order: z.number().int().default(100),
});
