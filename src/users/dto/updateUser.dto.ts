import { IsString, IsOptional, IsEmail, IsIn } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  @IsIn(['user', 'admin'], { message: 'Role must be either user or admin.' })
  role?: string;
}
