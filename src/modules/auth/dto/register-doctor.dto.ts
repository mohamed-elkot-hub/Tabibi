import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength} from 'class-validator';

export class RegisterDoctorDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @ApiProperty({ example: 'doctor@example.com' })
  @IsEmail()
  @MaxLength(120)
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  password: string;

  @ApiPropertyOptional({ example: '+201001234567' })
  @IsOptional()
  @Matches(/^\+?[0-9]{8,15}$/, { message: 'phone must be 8-15 digits' })
  phone?: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  specialty: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(40)
  licenseNumber: string;
}