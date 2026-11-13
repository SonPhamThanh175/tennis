/** Slug không dấu, chữ thường — dùng cho URL và tìm kiếm. */
export function slugify(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export type WeightClass = 'ULTRA_LIGHT' | 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'EXTRA_HEAVY';
export type HeadSizeClass = 'SMALL' | 'MIDPLUS' | 'OVERSIZE';

/** Nhóm trọng lượng tính từ gram (vợt chưa căng dây). */
export function weightClassOf(grams: number): WeightClass {
  if (grams < 250) return 'ULTRA_LIGHT';
  if (grams < 270) return 'LIGHT';
  if (grams < 290) return 'MEDIUM';
  if (grams <= 310) return 'HEAVY';
  return 'EXTRA_HEAVY';
}

/** Nhóm mặt vợt tính từ inch vuông. */
export function headSizeClassOf(sqIn: number): HeadSizeClass {
  if (sqIn <= 97) return 'SMALL';
  if (sqIn <= 102) return 'MIDPLUS';
  return 'OVERSIZE';
}
