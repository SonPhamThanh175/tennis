-- CreateEnum
CREATE TYPE "WeightClass" AS ENUM ('ULTRA_LIGHT', 'LIGHT', 'MEDIUM', 'HEAVY', 'EXTRA_HEAVY');

-- CreateEnum
CREATE TYPE "HeadSizeClass" AS ENUM ('SMALL', 'MIDPLUS', 'OVERSIZE');

-- CreateEnum
CREATE TYPE "Balance" AS ENUM ('HEAD_LIGHT', 'EVEN', 'HEAD_HEAVY');

-- CreateEnum
CREATE TYPE "StringPattern" AS ENUM ('P16X19', 'P16X18', 'P16X20', 'P18X20', 'P18X19');

-- CreateEnum
CREATE TYPE "PlayStyle" AS ENUM ('POWER', 'CONTROL', 'SPIN', 'ALL_ROUND');

-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR');

-- CreateEnum
CREATE TYPE "GripSize" AS ENUM ('G0', 'G1', 'G2', 'G3', 'G4', 'G5');

-- DropIndex
DROP INDEX "ProductVariant_sku_key";

-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "unitCost" INTEGER;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "balance" "Balance" NOT NULL,
ADD COLUMN     "beamWidthMm" TEXT,
ADD COLUMN     "headSizeClass" "HeadSizeClass" NOT NULL,
ADD COLUMN     "headSizeSqIn" INTEGER NOT NULL,
ADD COLUMN     "playStyle" "PlayStyle" NOT NULL,
ADD COLUMN     "stiffnessRA" INTEGER,
ADD COLUMN     "stringPattern" "StringPattern" NOT NULL,
ADD COLUMN     "swingWeight" INTEGER,
ADD COLUMN     "weightClass" "WeightClass" NOT NULL,
ADD COLUMN     "weightGrams" INTEGER NOT NULL,
ALTER COLUMN "level" SET NOT NULL;

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "color",
DROP COLUMN "size",
DROP COLUMN "sku",
ADD COLUMN     "condition" "Condition" NOT NULL,
ADD COLUMN     "conditionNote" TEXT,
ADD COLUMN     "costPrice" INTEGER,
ADD COLUMN     "gripSize" "GripSize" NOT NULL,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "internalCode" TEXT NOT NULL,
ADD COLUMN     "originalPrice" INTEGER,
ALTER COLUMN "stock" SET DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_internalCode_key" ON "ProductVariant"("internalCode");
