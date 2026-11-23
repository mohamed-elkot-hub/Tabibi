import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class SuperAdminLoginDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim().normalize('NFC').toLowerCase() : value)
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4096)
  password: string;
}
