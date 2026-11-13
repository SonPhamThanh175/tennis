import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ListProductsQuery } from './products.dto.js';
import { ProductsService } from './products.service.js';

@ApiTags('Products')
@Controller()
export class ProductsController {
  constructor(
    @Inject(ProductsService) private readonly products: ProductsService,
  ) {}

  @Get('products')
  list(@Query() query: ListProductsQuery) {
    return this.products.list(query);
  }

  @Get('products/:slug/related')
  related(@Param('slug') slug: string) {
    return this.products.related(slug);
  }

  @Get('products/:slug')
  bySlug(@Param('slug') slug: string) {
    return this.products.bySlug(slug);
  }

  @Get('categories')
  categories() {
    return this.products.categories();
  }

  @Get('brands')
  brands() {
    return this.products.brands();
  }
}
