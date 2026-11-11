import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'doctor@example.com' })
  @IsEmail()
  @MaxLength(120)
  email: string;

  @ApiProperty({ example: '12345678', maxLength: 64 })
  @IsString()
  @MaxLength(64)
  password: string;
}