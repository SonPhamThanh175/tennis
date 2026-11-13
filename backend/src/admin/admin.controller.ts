import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard, Roles } from '../auth/auth.guard.js';
import {
  CreateProductDto,
  CreateTaxonomyDto,
  CreateVariantDto,
  UpdateProductDto,
  UpdateTaxonomyDto,
  UpdateVariantDto,
} from '../products/products.dto.js';
import { UpdateOrderStatusDto } from '../orders/orders.dto.js';
import { AdminService } from './admin.service.js';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(@Inject(AdminService) private readonly admin: AdminService) {}

  @Get('stats')
  stats() {
    return this.admin.stats();
  }

  @Get('products')
  listProducts() {
    return this.admin.listProducts();
  }

  @Post('products')
  createProduct(@Body() dto: CreateProductDto) {
    return this.admin.createProduct(dto);
  }

  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.admin.updateProduct(id, dto);
  }

  @Delete('products/:id')
  deactivateProduct(@Param('id') id: string) {
    return this.admin.deactivateProduct(id);
  }

  @Get('variants')
  listVariants(@Query('inStock') inStock?: string) {
    return this.admin.listVariants(
      inStock === undefined ? undefined : inStock === 'true',
    );
  }

  @Get('variants/:id')
  getVariant(@Param('id') id: string) {
    return this.admin.getVariant(id);
  }

  @Post('products/:id/variants')
  createVariant(@Param('id') id: string, @Body() dto: CreateVariantDto) {
    return this.admin.createVariant(id, dto);
  }

  @Patch('variants/:id')
  updateVariant(@Param('id') id: string, @Body() dto: UpdateVariantDto) {
    return this.admin.updateVariant(id, dto);
  }

  @Get('brands')
  listBrands() {
    return this.admin.listTaxonomy('brand');
  }

  @Post('brands')
  createBrand(@Body() dto: CreateTaxonomyDto) {
    return this.admin.createTaxonomy('brand', dto);
  }

  @Patch('brands/:id')
  updateBrand(@Param('id') id: string, @Body() dto: UpdateTaxonomyDto) {
    return this.admin.updateTaxonomy('brand', id, dto);
  }

  @Delete('brands/:id')
  deleteBrand(@Param('id') id: string) {
    return this.admin.deleteTaxonomy('brand', id);
  }

  @Get('categories')
  listCategories() {
    return this.admin.listTaxonomy('category');
  }

  @Post('categories')
  createCategory(@Body() dto: CreateTaxonomyDto) {
    return this.admin.createTaxonomy('category', dto);
  }

  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateTaxonomyDto) {
    return this.admin.updateTaxonomy('category', id, dto);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.admin.deleteTaxonomy('category', id);
  }

  @Get('orders')
  listOrders(@Query('status') status?: UpdateOrderStatusDto['status']) {
    return this.admin.listOrders(status);
  }

  @Patch('orders/:id/status')
  updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.admin.updateOrderStatus(id, dto.status);
  }
}
