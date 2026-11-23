import { Transform } from 'class-transformer';
import { IsEmail, MaxLength } from 'class-validator';

export class RequestDoctorMagicLinkDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim().normalize('NFC').toLowerCase() : value)
  @IsEmail()
  @MaxLength(254)
  email: string;
}
