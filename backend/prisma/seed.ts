import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { headSizeClassOf, weightClassOf } from '../src/common/racquet.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type Cond = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
type Grip = 'G1' | 'G2' | 'G3' | 'G4';

interface Racquet {
  name: string;
  slug: string;
  brand: string;
  category: string;
  description: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  weightGrams: number;
  headSizeSqIn: number;
  balance: 'HEAD_LIGHT' | 'EVEN' | 'HEAD_HEAVY';
  stringPattern: 'P16X19' | 'P16X18' | 'P18X20';
  playStyle: 'POWER' | 'CONTROL' | 'SPIN' | 'ALL_ROUND';
  variants: {
    code: string;
    grip: Grip;
    condition: Cond;
    note?: string;
    price: number;
    cost: number;
  }[];
}

const racquets: Racquet[] = [
  {
    name: 'Wilson Pro Staff 97 v13',
    slug: 'wilson-pro-staff-97-v13',
    brand: 'wilson',
    category: 'vot-nguoi-lon',
    description: 'Vợt kiểm soát, cảm giác bóng tốt, dành cho người chơi nâng cao.',
    level: 'ADVANCED',
    weightGrams: 315,
    headSizeSqIn: 97,
    balance: 'HEAD_LIGHT',
    stringPattern: 'P16X19',
    playStyle: 'CONTROL',
    variants: [
      { code: 'VC-0001', grip: 'G2', condition: 'LIKE_NEW', note: 'Gần như không trầy, quấn cán mới.', price: 3900000, cost: 3000000 },
      { code: 'VC-0002', grip: 'G3', condition: 'GOOD', note: 'Trầy nhẹ ở đỉnh khung, sơn còn đẹp.', price: 3300000, cost: 2500000 },
    ],
  },
  {
    name: 'Babolat Pure Drive 2021',
    slug: 'babolat-pure-drive-2021',
    brand: 'babolat',
    category: 'vot-nguoi-lon',
    description: 'Vợt lực, phù hợp lối đánh baseline tấn công.',
    level: 'INTERMEDIATE',
    weightGrams: 300,
    headSizeSqIn: 100,
    balance: 'HEAD_HEAVY',
    stringPattern: 'P16X19',
    playStyle: 'POWER',
    variants: [
      { code: 'VC-0003', grip: 'G2', condition: 'GOOD', note: 'Vài vết trầy ở 3h và 9h, khung không nứt.', price: 2700000, cost: 2000000 },
      { code: 'VC-0004', grip: 'G3', condition: 'FAIR', note: 'Trầy nhiều ở đỉnh, bong sơn nhẹ. Đánh bình thường.', price: 2000000, cost: 1500000 },
    ],
  },
  {
    name: 'Head Speed MP 2022',
    slug: 'head-speed-mp-2022',
    brand: 'head',
    category: 'vot-nguoi-lon',
    description: 'Vợt đa dụng, cân bằng giữa lực và kiểm soát.',
    level: 'INTERMEDIATE',
    weightGrams: 300,
    headSizeSqIn: 100,
    balance: 'EVEN',
    stringPattern: 'P16X19',
    playStyle: 'ALL_ROUND',
    variants: [
      { code: 'VC-0005', grip: 'G3', condition: 'LIKE_NEW', note: 'Đánh vài buổi, khung sạch.', price: 3600000, cost: 2800000 },
    ],
  },
  {
    name: 'Yonex VCORE 98',
    slug: 'yonex-vcore-98',
    brand: 'yonex',
    category: 'vot-nguoi-lon',
    description: 'Vợt xoáy tốt, cảm giác êm tay.',
    level: 'ADVANCED',
    weightGrams: 305,
    headSizeSqIn: 98,
    balance: 'HEAD_LIGHT',
    stringPattern: 'P16X19',
    playStyle: 'SPIN',
    variants: [
      { code: 'VC-0006', grip: 'G2', condition: 'GOOD', note: 'Trầy nhẹ đỉnh khung, grommet còn tốt.', price: 3100000, cost: 2300000 },
    ],
  },
  {
    name: 'Wilson Blade 98 v8',
    slug: 'wilson-blade-98-v8',
    brand: 'wilson',
    category: 'vot-nguoi-lon',
    description: 'Cảm giác sắc, phù hợp người chơi control.',
    level: 'ADVANCED',
    weightGrams: 305,
    headSizeSqIn: 98,
    balance: 'HEAD_LIGHT',
    stringPattern: 'P16X19',
    playStyle: 'CONTROL',
    variants: [{ code: 'VC-0101', grip: 'G2', condition: 'GOOD', note: 'Trầy nhẹ 3h, grip mới.', price: 3400000, cost: 2600000 }],
  },
  {
    name: 'Wilson Clash 100 v2',
    slug: 'wilson-clash-100-v2',
    brand: 'wilson',
    category: 'vot-nguoi-lon',
    description: 'Dẻo, dễ chơi, phù hợp người mới lên trung cấp.',
    level: 'BEGINNER',
    weightGrams: 295,
    headSizeSqIn: 100,
    balance: 'EVEN',
    stringPattern: 'P16X19',
    playStyle: 'ALL_ROUND',
    variants: [{ code: 'VC-0102', grip: 'G2', condition: 'LIKE_NEW', note: 'Ít dùng, sơn còn bóng.', price: 2800000, cost: 2100000 }],
  },
  {
    name: 'Wilson Ultra 100 v4',
    slug: 'wilson-ultra-100-v4',
    brand: 'wilson',
    category: 'vot-nguoi-lon',
    description: 'Vợt lực, dễ đưa bóng sâu.',
    level: 'INTERMEDIATE',
    weightGrams: 300,
    headSizeSqIn: 100,
    balance: 'HEAD_HEAVY',
    stringPattern: 'P16X19',
    playStyle: 'POWER',
    variants: [{ code: 'VC-0103', grip: 'G3', condition: 'GOOD', note: 'Trầy đỉnh khung, đánh ổn.', price: 2500000, cost: 1800000 }],
  },
  {
    name: 'Wilson Burn 100s',
    slug: 'wilson-burn-100s',
    brand: 'wilson',
    category: 'vot-nguoi-lon',
    description: 'Mặt dày, dễ tạo xoáy.',
    level: 'INTERMEDIATE',
    weightGrams: 300,
    headSizeSqIn: 100,
    balance: 'EVEN',
    stringPattern: 'P18X20',
    playStyle: 'SPIN',
    variants: [{ code: 'VC-0104', grip: 'G2', condition: 'FAIR', note: 'Bong sơn nhẹ, khung chắc.', price: 1900000, cost: 1400000 }],
  },
  {
    name: 'Babolat Pure Aero 2023',
    slug: 'babolat-pure-aero-2023',
    brand: 'babolat',
    category: 'vot-nguoi-lon',
    description: 'Vợt xoáy đặc trưng Aero.',
    level: 'INTERMEDIATE',
    weightGrams: 300,
    headSizeSqIn: 100,
    balance: 'HEAD_HEAVY',
    stringPattern: 'P16X19',
    playStyle: 'SPIN',
    variants: [{ code: 'VC-0105', grip: 'G3', condition: 'GOOD', note: 'Trầy 9h nhẹ, grommet tốt.', price: 3200000, cost: 2400000 }],
  },
  {
    name: 'Babolat Pure Strike 98',
    slug: 'babolat-pure-strike-98',
    brand: 'babolat',
    category: 'vot-nguoi-lon',
    description: 'Kiểm soát, cảm giác rắn.',
    level: 'ADVANCED',
    weightGrams: 305,
    headSizeSqIn: 98,
    balance: 'HEAD_LIGHT',
    stringPattern: 'P16X19',
    playStyle: 'CONTROL',
    variants: [{ code: 'VC-0106', grip: 'G2', condition: 'LIKE_NEW', note: 'Gần như mới, quấn cán mới.', price: 3700000, cost: 2900000 }],
  },
  {
    name: 'Babolat Boost Drive',
    slug: 'babolat-boost-drive',
    brand: 'babolat',
    category: 'vot-nguoi-lon',
    description: 'Nhẹ, dễ vung, hợp người mới.',
    level: 'BEGINNER',
    weightGrams: 260,
    headSizeSqIn: 102,
    balance: 'EVEN',
    stringPattern: 'P16X19',
    playStyle: 'POWER',
    variants: [{ code: 'VC-0107', grip: 'G2', condition: 'GOOD', note: 'Trầy nhẹ cán, mặt vợt sạch.', price: 1600000, cost: 1100000 }],
  },
  {
    name: 'Babolat Pure Drive Team',
    slug: 'babolat-pure-drive-team',
    brand: 'babolat',
    category: 'vot-nguoi-lon',
    description: 'Phiên bản nhẹ hơn Pure Drive.',
    level: 'INTERMEDIATE',
    weightGrams: 285,
    headSizeSqIn: 100,
    balance: 'EVEN',
    stringPattern: 'P16X19',
    playStyle: 'POWER',
    variants: [{ code: 'VC-0108', grip: 'G1', condition: 'GOOD', note: 'Trầy đỉnh, không nứt.', price: 2400000, cost: 1800000 }],
  },
  {
    name: 'Head Radical MP 2023',
    slug: 'head-radical-mp-2023',
    brand: 'head',
    category: 'vot-nguoi-lon',
    description: 'Đa dụng, cảm giác Auxetic.',
    level: 'INTERMEDIATE',
    weightGrams: 300,
    headSizeSqIn: 98,
    balance: 'EVEN',
    stringPattern: 'P16X19',
    playStyle: 'ALL_ROUND',
    variants: [{ code: 'VC-0109', grip: 'G3', condition: 'LIKE_NEW', note: 'Ít trầy, bumper còn dày.', price: 3500000, cost: 2700000 }],
  },
  {
    name: 'Head Gravity Pro 2023',
    slug: 'head-gravity-pro-2023',
    brand: 'head',
    category: 'vot-nguoi-lon',
    description: 'Mặt teardrop, kiểm soát tốt.',
    level: 'ADVANCED',
    weightGrams: 315,
    headSizeSqIn: 100,
    balance: 'HEAD_LIGHT',
    stringPattern: 'P18X20',
    playStyle: 'CONTROL',
    variants: [{ code: 'VC-0110', grip: 'G2', condition: 'GOOD', note: 'Trầy 12h nhẹ.', price: 3800000, cost: 3000000 }],
  },
  {
    name: 'Head Extreme MP 2022',
    slug: 'head-extreme-mp-2022',
    brand: 'head',
    category: 'vot-nguoi-lon',
    description: 'Spin, lực, hợp baseline.',
    level: 'INTERMEDIATE',
    weightGrams: 300,
    headSizeSqIn: 100,
    balance: 'HEAD_HEAVY',
    stringPattern: 'P16X19',
    playStyle: 'SPIN',
    variants: [{ code: 'VC-0111', grip: 'G2', condition: 'FAIR', note: 'Bong sơn cạnh, đánh được.', price: 2100000, cost: 1500000 }],
  },
  {
    name: 'Head Boom MP',
    slug: 'head-boom-mp',
    brand: 'head',
    category: 'vot-nguoi-lon',
    description: 'Dễ lực, tiếng bóng chắc.',
    level: 'BEGINNER',
    weightGrams: 295,
    headSizeSqIn: 100,
    balance: 'EVEN',
    stringPattern: 'P16X19',
    playStyle: 'POWER',
    variants: [{ code: 'VC-0112', grip: 'G3', condition: 'GOOD', note: 'Trầy nhẹ bumper.', price: 2700000, cost: 2000000 }],
  },
  {
    name: 'Yonex EZONE 98',
    slug: 'yonex-ezone-98',
    brand: 'yonex',
    category: 'vot-nguoi-lon',
    description: 'Êm tay, lực vừa phải.',
    level: 'INTERMEDIATE',
    weightGrams: 305,
    headSizeSqIn: 98,
    balance: 'EVEN',
    stringPattern: 'P16X19',
    playStyle: 'ALL_ROUND',
    variants: [{ code: 'VC-0113', grip: 'G2', condition: 'LIKE_NEW', note: 'Sơn đẹp, grip zin.', price: 3600000, cost: 2800000 }],
  },
  {
    name: 'Yonex EZONE 100',
    slug: 'yonex-ezone-100',
    brand: 'yonex',
    category: 'vot-nguoi-lon',
    description: 'Dễ chơi hơn bản 98.',
    level: 'BEGINNER',
    weightGrams: 300,
    headSizeSqIn: 100,
    balance: 'EVEN',
    stringPattern: 'P16X19',
    playStyle: 'POWER',
    variants: [{ code: 'VC-0114', grip: 'G2', condition: 'GOOD', note: 'Trầy 3h-9h nhẹ.', price: 3000000, cost: 2200000 }],
  },
  {
    name: 'Yonex VCORE 100',
    slug: 'yonex-vcore-100',
    brand: 'yonex',
    category: 'vot-nguoi-lon',
    description: 'Xoáy mạnh, mặt 100 dễ dung.',
    level: 'INTERMEDIATE',
    weightGrams: 300,
    headSizeSqIn: 100,
    balance: 'HEAD_HEAVY',
    stringPattern: 'P16X19',
    playStyle: 'SPIN',
    variants: [{ code: 'VC-0115', grip: 'G3', condition: 'GOOD', note: 'Grommet mòn nhẹ.', price: 2900000, cost: 2100000 }],
  },
  {
    name: 'Yonex Percept 97',
    slug: 'yonex-percept-97',
    brand: 'yonex',
    category: 'vot-nguoi-lon',
    description: 'Cảm giác bóng tốt, control.',
    level: 'ADVANCED',
    weightGrams: 310,
    headSizeSqIn: 97,
    balance: 'HEAD_LIGHT',
    stringPattern: 'P16X19',
    playStyle: 'CONTROL',
    variants: [{ code: 'VC-0116', grip: 'G2', condition: 'LIKE_NEW', note: 'Gần như không trầy.', price: 4000000, cost: 3200000 }],
  },
  {
    name: 'Wilson Pro Staff 97L',
    slug: 'wilson-pro-staff-97l',
    brand: 'wilson',
    category: 'vot-nguoi-lon',
    description: 'Bản nhẹ hơn Pro Staff 97.',
    level: 'INTERMEDIATE',
    weightGrams: 290,
    headSizeSqIn: 97,
    balance: 'HEAD_LIGHT',
    stringPattern: 'P18X20',
    playStyle: 'CONTROL',
    variants: [{ code: 'VC-0117', grip: 'G1', condition: 'GOOD', note: 'Trầy đỉnh nhẹ.', price: 2800000, cost: 2100000 }],
  },
  {
    name: 'Babolat Pure Aero Rafa',
    slug: 'babolat-pure-aero-rafa',
    brand: 'babolat',
    category: 'vot-nguoi-lon',
    description: 'Phiên bản Rafa, xoáy và lực.',
    level: 'ADVANCED',
    weightGrams: 300,
    headSizeSqIn: 100,
    balance: 'HEAD_HEAVY',
    stringPattern: 'P16X19',
    playStyle: 'SPIN',
    variants: [{ code: 'VC-0118', grip: 'G3', condition: 'GOOD', note: 'Trầy bumper, khung chắc.', price: 3300000, cost: 2500000 }],
  },
  {
    name: 'Head Speed Pro 2022',
    slug: 'head-speed-pro-2022',
    brand: 'head',
    category: 'vot-nguoi-lon',
    description: 'Nặng hơn Speed MP, kiểm soát.',
    level: 'ADVANCED',
    weightGrams: 310,
    headSizeSqIn: 100,
    balance: 'HEAD_LIGHT',
    stringPattern: 'P18X20',
    playStyle: 'CONTROL',
    variants: [{ code: 'VC-0119', grip: 'G2', condition: 'FAIR', note: 'Trầy nhiều nhưng đánh tốt.', price: 2200000, cost: 1600000 }],
  },
  {
    name: 'Yonex VCORE Pro 97',
    slug: 'yonex-vcore-pro-97',
    brand: 'yonex',
    category: 'vot-nguoi-lon',
    description: 'Tour, cảm giác rắn, control.',
    level: 'ADVANCED',
    weightGrams: 310,
    headSizeSqIn: 97,
    balance: 'HEAD_LIGHT',
    stringPattern: 'P16X19',
    playStyle: 'CONTROL',
    variants: [{ code: 'VC-0120', grip: 'G2', condition: 'GOOD', note: 'Trầy nhẹ 12h, grip mới.', price: 3500000, cost: 2700000 }],
  },
];

async function main() {
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const customerPassword = await bcrypt.hash('Customer@123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@tennis.local' },
    update: {},
    create: {
      email: 'admin@tennis.local',
      passwordHash: adminPassword,
      fullName: 'Quản trị viên',
      role: 'ADMIN',
    },
  });
  await prisma.user.upsert({
    where: { email: 'khach@tennis.local' },
    update: {},
    create: {
      email: 'khach@tennis.local',
      passwordHash: customerPassword,
      fullName: 'Khách hàng mẫu',
      phone: '0900000000',
    },
  });

  const categories = [
    { name: 'Vợt người lớn', slug: 'vot-nguoi-lon' },
    { name: 'Vợt trẻ em', slug: 'vot-tre-em' },
  ];
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }

  const brands = [
    { name: 'Wilson', slug: 'wilson' },
    { name: 'Babolat', slug: 'babolat' },
    { name: 'Head', slug: 'head' },
    { name: 'Yonex', slug: 'yonex' },
  ];
  for (const b of brands) {
    await prisma.brand.upsert({ where: { slug: b.slug }, update: {}, create: b });
  }

  for (const r of racquets) {
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: r.category } });
    const brand = await prisma.brand.findUniqueOrThrow({ where: { slug: r.brand } });
    await prisma.product.upsert({
      where: { slug: r.slug },
      update: {},
      create: {
        name: r.name,
        slug: r.slug,
        description: r.description,
        images: [],
        level: r.level,
        weightGrams: r.weightGrams,
        weightClass: weightClassOf(r.weightGrams),
        headSizeSqIn: r.headSizeSqIn,
        headSizeClass: headSizeClassOf(r.headSizeSqIn),
        balance: r.balance,
        stringPattern: r.stringPattern,
        playStyle: r.playStyle,
        categoryId: category.id,
        brandId: brand.id,
        variants: {
          create: r.variants.map((v) => ({
            internalCode: v.code,
            gripSize: v.grip,
            condition: v.condition,
            conditionNote: v.note,
            images: [],
            price: v.price,
            costPrice: v.cost,
            stock: 1,
          })),
        },
      },
    });
  }

  console.log('Seed xong.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
