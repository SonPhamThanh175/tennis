import {
  BALANCE_LABEL,
  HEAD_SIZE_LABEL,
  LEVEL_LABEL,
  PLAY_STYLE_LABEL,
  STRING_PATTERN_LABEL,
  WEIGHT_CLASS_LABEL,
} from '@/lib/format';
import type { Product } from '@/types/api';

export function SpecMatrix({ product: p }: { product: Product }) {
  const rows: [string, string][] = [
    ['Trọng lượng', `${p.weightGrams}g · ${WEIGHT_CLASS_LABEL[p.weightClass]}`],
    ['Mặt vợt', `${p.headSizeSqIn} in² · ${HEAD_SIZE_LABEL[p.headSizeClass]}`],
    ['Mật độ dây', STRING_PATTERN_LABEL[p.stringPattern]],
    ['Điểm cân bằng', BALANCE_LABEL[p.balance]],
    ['Lối chơi', PLAY_STYLE_LABEL[p.playStyle]],
    ['Trình độ', LEVEL_LABEL[p.level]],
    ...(p.stiffnessRA ? ([['Độ cứng RA', String(p.stiffnessRA)]] as [string, string][]) : []),
    ...(p.swingWeight ? ([['Swingweight', String(p.swingWeight)]] as [string, string][]) : []),
    ...(p.beamWidthMm ? ([['Độ dày khung', `${p.beamWidthMm} mm`]] as [string, string][]) : []),
  ];
  return (
    <div>
      <h2 className="display mb-3 text-2xl">Thông số kỹ thuật</h2>
      <dl className="divide-y divide-neutral-200 border-y border-neutral-200 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[140px_1fr] py-2.5">
            <dt className="text-neutral-500">{k}</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
