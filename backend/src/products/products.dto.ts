import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export const SKILL_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
export const BALANCES = ['HEAD_LIGHT', 'EVEN', 'HEAD_HEAVY'] as const;
export const STRING_PATTERNS = ['P16X19', 'P16X18', 'P16X20', 'P18X20', 'P18X19'] as const;
export const PLAY_STYLES = ['POWER', 'CONTROL', 'SPIN', 'ALL_ROUND'] as const;
export const CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'] as const;
export const GRIP_SIZES = ['G0', 'G1', 'G2', 'G3', 'G4', 'G5'] as const;

export type SkillLevel = (typeof SKILL_LEVELS)[number];
export type Balance = (typeof BALANCES)[number];
export type StringPattern = (typeof STRING_PATTERNS)[number];
export type PlayStyle = (typeof PLAY_STYLES)[number];
export type Condition = (typeof CONDITIONS)[number];
export type GripSize = (typeof GRIP_SIZES)[number];

export class ListProductsQuery {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsEnum(SKILL_LEVELS) level?: SkillLevel;
  @IsOptional() @IsEnum(CONDITIONS) condition?: Condition;
  @IsOptional() @IsEnum(GRIP_SIZES) gripSize?: GripSize;
  @IsOptional() @IsEnum(PLAY_STYLES) playStyle?: PlayStyle;
  @IsOptional() @IsEnum(BALANCES) balance?: Balance;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) minPrice?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) maxPrice?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number;
}

export class VariantDto {
  @IsOptional() @IsString() @IsNotEmpty() internalCode?: string;
  @IsEnum(GRIP_SIZES) gripSize: GripSize;
  @IsEnum(CONDITIONS) condition: Condition;
  /** Bắt buộc với mọi tình trạng trừ NEW. */
  @ValidateIf((o: VariantDto) => o.condition !== 'NEW')
  @IsString()
  @IsNotEmpty({ message: 'Hàng cũ phải có mô tả tình trạng' })
  conditionNote?: string;
  @IsArray() @IsString({ each: true }) images: string[] = [];
  @Type(() => Number) @IsInt() @Min(0) price: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) originalPrice?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) costPrice?: number;
  @Type(() => Number) @IsInt() @Min(0) stock: number;
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateProductDto {
  @IsString() @IsNotEmpty() name: string;
  @Matches(SLUG, { message: 'slug chỉ gồm chữ thường, số và dấu gạch ngang' })
  slug: string;
  @IsString() description: string;
  @IsArray() @IsString({ each: true }) images: string[];
  @IsEnum(SKILL_LEVELS) level: SkillLevel;
  @IsInt() @Min(200) @Max(400) weightGrams: number;
  @IsInt() @Min(80) @Max(120) headSizeSqIn: number;
  @IsEnum(BALANCES) balance: Balance;
  @IsEnum(STRING_PATTERNS) stringPattern: StringPattern;
  @IsEnum(PLAY_STYLES) playStyle: PlayStyle;
  @IsOptional() @IsInt() @Min(0) stiffnessRA?: number;
  @IsOptional() @IsInt() @Min(0) swingWeight?: number;
  @IsOptional() @IsString() beamWidthMm?: string;
  @IsString() categoryId: string;
  @IsString() brandId: string;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => VariantDto)
  variants: VariantDto[];
}

/** Khi cập nhật mẫu vợt, từng cây vợt được quản lý riêng qua UpdateVariantDto. */
export class UpdateProductDto {
  @IsOptional() @IsString() @IsNotEmpty() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];
  @IsOptional() @IsEnum(SKILL_LEVELS) level?: SkillLevel;
  @IsOptional() @IsInt() @Min(200) @Max(400) weightGrams?: number;
  @IsOptional() @IsInt() @Min(80) @Max(120) headSizeSqIn?: number;
  @IsOptional() @IsEnum(BALANCES) balance?: Balance;
  @IsOptional() @IsEnum(STRING_PATTERNS) stringPattern?: StringPattern;
  @IsOptional() @IsEnum(PLAY_STYLES) playStyle?: PlayStyle;
  @IsOptional() @IsInt() @Min(0) stiffnessRA?: number;
  @IsOptional() @IsInt() @Min(0) swingWeight?: number;
  @IsOptional() @IsString() beamWidthMm?: string;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsString() brandId?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class CreateVariantDto extends VariantDto {}

export class UpdateVariantDto {
  @IsOptional() @IsString() @IsNotEmpty() internalCode?: string;
  @IsOptional() @IsEnum(GRIP_SIZES) gripSize?: GripSize;
  @IsOptional() @IsEnum(CONDITIONS) condition?: Condition;
  @IsOptional() @IsString() conditionNote?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];
  @IsOptional() @IsInt() @Min(0) price?: number;
  @IsOptional() @IsInt() @Min(0) originalPrice?: number;
  @IsOptional() @IsInt() @Min(0) costPrice?: number;
  @IsOptional() @IsInt() @Min(0) stock?: number;
}

export class BulkVariantIdsDto {
  @IsArray() @ArrayMinSize(1) @IsString({ each: true })
  ids: string[];
}

/** Dùng chung cho thương hiệu và danh mục. */
export class CreateTaxonomyDto {
  @IsString() @IsNotEmpty() name: string;
  @Matches(SLUG, { message: 'slug chỉ gồm chữ thường, số và dấu gạch ngang' })
  slug: string;
}

export class UpdateTaxonomyDto {
  @IsOptional() @IsString() @IsNotEmpty() name?: string;
  @IsOptional() @Matches(SLUG, { message: 'slug chỉ gồm chữ thường, số và dấu gạch ngang' })
  slug?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
