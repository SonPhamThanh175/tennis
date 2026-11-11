import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard, type JwtPayload } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { AddCartItemDto, UpdateCartItemDto } from './cart.dto.js';
import { CartService } from './cart.service.js';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('cart')
export class CartController {
  constructor(@Inject(CartService) private readonly cart: CartService) {}

  @Get()
  get(@CurrentUser() user: JwtPayload) {
    return this.cart.get(user.sub);
  }

  @Post('items')
  add(@CurrentUser() user: JwtPayload, @Body() dto: AddCartItemDto) {
    return this.cart.add(user.sub, dto.variantId, dto.quantity);
  }

  @Patch('items/:id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cart.update(user.sub, id, dto.quantity);
  }

  @Delete('items/:id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.cart.remove(user.sub, id);
  }
}
