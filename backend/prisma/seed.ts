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
