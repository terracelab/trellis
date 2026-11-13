// 기사 앱(WarehouseScan · 모바일 한 열): 지금 배송지 · 송장 스캔 · 인수 사진 · 서명 → 배송 완료, 배송지 목록, 적재함 온도 기록
import { formatAmount, formatDate, formatQuantity } from '@terracelab/trellis-contracts';
import {
  ActionBar,
  Badge,
  Button,
  Card,
  DescriptionList,
  EmptyState,
  Field,
  FileUpload,
  Icon,
  Input,
  PageHeader,
  Progress,
  QuantityInput,
  ScanField,
  Sparkline,
  StatusDot,
  useToast,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import {
  boxCodes,
  consigneeById,
  DELIVERY_ORDERS,
  DELIVERY_STATES,
  DRIVER_TRUCK_ID,
  PLANT,
  TEMP_LOG,
  truckById,
  type DeliveryOrder,
} from '../../../_data/mes-delivery.js';
import { coldRuleLabel, NOW, PROFILE, withinCold } from '../../../_data/profile.js';
import { TODAY } from '../../../_data/trade.js';
import { useCan } from '../../../_platform/index.js';
import { josa, Lines, Page } from '../../../_ui/index.js';
import './style.css';

const TRUCK = truckById(DRIVER_TRUCK_ID);
const fmtTemp = (v: number) => `${formatAmount(v, { digits: 1 })}°C`;
/** 도착 · 완료를 누른 시각(데모 시계) */
const ARRIVED_AT = NOW;
const DONE_AT = NOW;
/** 운행 회차(1회차 운행 중 → 1회차) */
const ROUND = TRUCK.round.split(' ')[0] ?? TRUCK.round;

interface Photo {
  name: string;
  size: number;
  status: 'done';
}

export default function DriverApp() {
  const toast = useToast();
  const canWork = useCan('delivery', 'update');
  const [stops, setStops] = useState<DeliveryOrder[]>(() =>
    DELIVERY_ORDERS.filter((o) => o.truckId === TRUCK.id)
      .map((o) => ({ ...o }))
      .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0)),
  );
  const current = stops.find((o) => o.state !== 'delivered') ?? null;
  const [arrived, setArrived] = useState(true);
  const [scanned, setScanned] = useState<string[]>(() =>
    current ? boxCodes(current).slice(0, 6) : [],
  );
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [receiver, setReceiver] = useState(() =>
    current ? consigneeById(current.consigneeId).contact : '',
  );
  const [signedAt, setSignedAt] = useState<string | null>(null);
  const [temps, setTemps] = useState(() => [...TEMP_LOG]);
  const [reading, setReading] = useState<number | null>(TRUCK.tempNow ?? null);

  const done = stops.filter((o) => o.state === 'delivered').length;
  const c = current ? consigneeById(current.consigneeId) : null;
  const codes = current ? boxCodes(current) : [];
  const allScanned = !!current && scanned.length >= current.boxes;
  const ready = allScanned && photos.length > 0 && !!signedAt && receiver.trim().length > 0;
  const lastTemp = temps[temps.length - 1]!;
  const next = current ? stops.find((o) => o.state !== 'delivered' && o.id !== current.id) : null;

  const scan = (raw: string) => {
    if (!current) return;
    const code = raw.trim().toUpperCase();
    if (!codes.includes(code)) {
      toast.show({
        title: '이 배송지의 박스가 아닙니다',
        description: `${code} · ${c?.name} 박스는 ${current.id}-01부터 시작합니다`,
        tone: 'danger',
      });
      return;
    }
    if (scanned.includes(code)) {
      toast.show({ title: '이미 스캔한 박스입니다', description: code, tone: 'warning' });
      return;
    }
    setArrived(true);
    setScanned((s) => [...s, code]);
  };

  const complete = () => {
    if (!current || !c) return;
    setStops((ss) =>
      ss.map((o) => (o.id === current.id ? { ...o, state: 'delivered', deliveredAt: DONE_AT } : o)),
    );
    const following = stops.find((o) => o.state !== 'delivered' && o.id !== current.id);
    setArrived(false);
    setScanned([]);
    setPhotos([]);
    setSignedAt(null);
    setReceiver(following ? consigneeById(following.consigneeId).contact : '');
    toast.show({
      title: `${c.name} 배송을 완료했습니다`,
      description: following
        ? `다음 배송지 ${consigneeById(following.consigneeId).name} · 도착 예정 ${following.eta}`
        : '오늘 배송을 모두 마쳤습니다',
      tone: 'success',
    });
  };

  return (
    <Page>
      <div className="tl-block-driver">
        <PageHeader
          title="오늘 배송"
          description={`${formatDate(TODAY, 'mdw')} · ${TRUCK.plate} · ${TRUCK.driver}`}
          meta={
            <Badge tone="info" size="sm">
              {ROUND}
            </Badge>
          }
        />
        <Progress
          label={`배송 ${formatQuantity(done, '곳')} 완료 · ${TRUCK.departAt} 출발`}
          value={done}
          max={stops.length}
          unit="곳"
          tone={done === stops.length ? 'success' : undefined}
        />

        {current && c ? (
          <>
            <Card
              title={c.name}
              subtitle={`${stops.indexOf(current) + 1}번째 배송지 · ${arrived ? `${ARRIVED_AT} 도착` : `도착 예정 ${current.eta}`}`}
              action={
                <Badge tone={arrived ? 'warning' : DELIVERY_STATES.shipping.tone}>
                  {arrived ? '하차 중' : DELIVERY_STATES.shipping.label}
                </Badge>
              }
            >
              <div className="tl-block-driver__stack">
                <DescriptionList
                  columns={1}
                  items={[
                    { label: '주소', value: c.address, copyable: true },
                    { label: '하차 위치', value: c.dock },
                    { label: '연락처', value: `${c.contact} · ${c.phone}` },
                    {
                      label: '품목',
                      value: `${current.items} · ${formatQuantity(current.boxes, '박스')}`,
                    },
                    { label: '도착 희망', value: current.window },
                  ]}
                />
                <div className="tl-block-driver__buttons">
                  <Button
                    size="lg"
                    icon="phone"
                    fullWidth
                    onPress={() =>
                      toast.show({ title: `${c.contact}에게 전화를 겁니다`, description: c.phone })
                    }
                  >
                    전화
                  </Button>
                  <Button
                    size="lg"
                    icon="map-pin"
                    fullWidth
                    disabled={arrived || !canWork}
                    onPress={() => {
                      setArrived(true);
                      toast.show({
                        title: '도착을 알렸습니다',
                        description: `${c.name} · 배차 담당 ${PROFILE.people.logistics}`,
                      });
                    }}
                  >
                    {arrived ? `${ARRIVED_AT} 도착` : '도착'}
                  </Button>
                </div>
              </div>
            </Card>

            <Card title="인수 확인" subtitle="박스 송장 스캔 · 인수 사진 · 받는 분 서명">
              <div className="tl-block-driver__stack">
                <ScanField
                  label="송장 스캔"
                  placeholder={`박스 송장을 스캔하세요 · ${current.id}-01`}
                  keepFocus={false}
                  disabled={!canWork}
                  recent={scanned.slice(-3).reverse()}
                  onScan={scan}
                />
                <div className="tl-block-driver__scan">
                  <Progress
                    label="박스 확인"
                    value={scanned.length}
                    max={current.boxes}
                    unit="박스"
                    tone={allScanned ? 'success' : undefined}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={allScanned || !canWork}
                    onPress={() => {
                      const left = codes.find((code) => !scanned.includes(code));
                      if (left) scan(left);
                    }}
                  >
                    송장 훼손 · 수기 확인
                  </Button>
                </div>
                <Field label="인수 사진" required>
                  <FileUpload
                    accept="image/*"
                    multiple
                    maxSize={10_485_760}
                    hint="하차 위치와 박스가 함께 보이게 · JPG · PNG, 10MB 이하"
                    disabled={!canWork}
                    files={photos}
                    onFilesChange={(files) =>
                      setPhotos((p) => [
                        ...p,
                        ...files.map((f) => ({
                          name: f.name,
                          size: f.size,
                          status: 'done' as const,
                        })),
                      ])
                    }
                    onRemove={(name) => setPhotos((p) => p.filter((f) => f.name !== name))}
                  />
                </Field>
                <Field label="받는 분" required>
                  <Input value={receiver} onChange={setReceiver} placeholder={c.contact} />
                </Field>
                <Field label="받는 분 서명" required>
                  <button
                    type="button"
                    className="tl-block-sign tl-focusable"
                    data-signed={signedAt ? true : undefined}
                    disabled={!canWork}
                    onClick={() => setSignedAt(signedAt ? null : DONE_AT)}
                  >
                    {signedAt ? (
                      <>
                        <span className="tl-block-sign__name">{receiver || c.contact}</span>
                        <span className="tl-block-muted">
                          {signedAt} 서명 · 누르면 다시 받습니다
                        </span>
                      </>
                    ) : (
                      <>
                        <Icon name="pen-line" size={24} />
                        <span>누르고 받는 분에게 화면을 건네 서명을 받습니다</span>
                      </>
                    )}
                  </button>
                </Field>
              </div>
            </Card>
          </>
        ) : (
          <Card>
            <EmptyState
              icon="package-check"
              title="오늘 배송을 모두 마쳤습니다"
              description={`${josa(PLANT.name, '으로/로')} 복귀하고 적재함 온도를 마지막으로 기록하세요`}
            />
          </Card>
        )}

        <Card
          title="배송지"
          subtitle={`${stops.length}곳 · ${next ? `다음 ${consigneeById(next.consigneeId).name}` : current ? '마지막 배송지' : '배송 끝'}`}
        >
          <ol className="tl-block-stops">
            {stops.map((o, i) => {
              const sc = consigneeById(o.consigneeId);
              const isCurrent = o.id === current?.id;
              return (
                <li key={o.id} className="tl-block-stop" data-current={isCurrent || undefined}>
                  <span className="tl-block-stop__no">{i + 1}</span>
                  <Lines
                    primary={sc.name}
                    secondary={
                      <>
                        {sc.region} · {formatQuantity(o.boxes, '박스')} · {o.window}
                      </>
                    }
                  />
                  <StatusDot
                    size="sm"
                    tone={o.state === 'delivered' ? 'success' : isCurrent ? 'info' : 'neutral'}
                    pulse={isCurrent}
                  >
                    {o.state === 'delivered'
                      ? `완료 ${o.deliveredAt}`
                      : isCurrent
                        ? arrived
                          ? '하차 중'
                          : '이동 중'
                        : `예정 ${o.eta}`}
                  </StatusDot>
                </li>
              );
            })}
          </ol>
        </Card>

        <Card
          title="적재함 온도"
          subtitle={`${PROFILE.cold ? `기준 ${coldRuleLabel()} · ` : ''}마지막 기록 ${lastTemp.time}`}
        >
          <div className="tl-block-driver__stack">
            <div className="tl-block-temp">
              <span className="tl-block-temp__value">{fmtTemp(lastTemp.value)}</span>
              <StatusDot tone={withinCold(lastTemp.value) ? 'success' : 'danger'}>
                {withinCold(lastTemp.value) ? '기준 이내' : '기준 초과'}
              </StatusDot>
            </div>
            <Sparkline
              data={temps.map((t) => t.value)}
              width={400}
              height={40}
              ariaLabel={`오늘 적재함 온도 기록 ${temps.length}회. ${fmtTemp(temps[0]!.value)}에서 ${fmtTemp(lastTemp.value)}`}
            />
            <div className="tl-block-temp__record">
              <Field label="측정 온도">
                <QuantityInput
                  size="lg"
                  value={reading}
                  onChange={setReading}
                  unit="°C"
                  min={-30}
                  max={15}
                  step={0.1}
                  digits={1}
                />
              </Field>
              <Button
                size="lg"
                icon="clipboard-check"
                disabled={reading == null || !canWork}
                onPress={() => {
                  if (reading == null) return;
                  setTemps((t) => [...t, { time: PLANT.now, value: reading }]);
                  toast.show({
                    title: '온도를 기록했습니다',
                    description: `${PLANT.now} · ${fmtTemp(reading)}`,
                    tone: withinCold(reading) ? 'success' : 'warning',
                  });
                }}
              >
                기록
              </Button>
            </div>
            <ul className="tl-block-temp__log">
              {[...temps]
                .reverse()
                .slice(0, 3)
                .map((t) => (
                  <li key={t.time}>
                    <span className="tl-block-code">{t.time}</span>
                    <span className="tl-block-code">{fmtTemp(t.value)}</span>
                  </li>
                ))}
            </ul>
          </div>
        </Card>

        {current && (
          <ActionBar
            sticky
            summary={
              ready
                ? '인수 확인을 마쳤습니다'
                : [
                    !allScanned && `박스 ${scanned.length}/${current.boxes}`,
                    photos.length === 0 && '사진 필요',
                    !signedAt && '서명 필요',
                  ]
                    .filter(Boolean)
                    .join(' · ')
            }
          >
            <Button
              variant="primary"
              size="lg"
              icon="package-check"
              disabled={!ready || !canWork}
              onPress={complete}
            >
              배송 완료
            </Button>
          </ActionBar>
        )}
      </div>
    </Page>
  );
}
