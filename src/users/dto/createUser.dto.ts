import {
  IsString,
  IsEmail,
  IsIn,
  IsNotEmpty,
  MinLength,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password minimum length is 8 characters.' })
  password: string;

  @IsString()
  @IsOptional()
  @IsIn(['user', 'admin'], { message: 'Role must be either user or admin' })
  role?: string;
}
