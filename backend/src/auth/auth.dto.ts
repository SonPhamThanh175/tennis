import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;
  @IsString() @MinLength(1) fullName: string;
  @IsOptional()
  @Matches(/^0\d{9}$/, { message: 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0' })
  phone?: string;
}

export class LoginDto {
  @IsEmail() email: string;
  @IsString() password: string;
}
