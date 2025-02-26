import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginRequest {
  @IsEmail()
  @Transform(({ value }) => value.trim())
  @Transform(({ value }) => value.replace(/\s+/g, ' '))
  public readonly email: string;

  @IsString()
  @MinLength(8)
  public readonly password: string;
}

export class LoginResponse {
  public token: string;
}
