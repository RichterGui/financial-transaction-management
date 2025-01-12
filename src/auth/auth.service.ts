import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { hash, compare } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { LoginDto } from './dto/login.dto';
config();

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(createUserDto: CreateUserDto) {
    const hashedPassword = await this.hashPasssword(createUserDto.password);
    if (!hashedPassword) {
      throw new HttpException('encryption failed.', HttpStatus.BAD_REQUEST);
    }
    const registeredUser = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    if (!registeredUser)
      throw new HttpException(
        'An error occurred while registering this user.',
        HttpStatus.BAD_REQUEST,
      );

    return registeredUser;
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    const comparedPasswords = await this.comparePassword(
      loginDto.password,
      user.password,
    );
    if (!comparedPasswords) {
      throw new HttpException('Invalid Password', HttpStatus.BAD_REQUEST);
    }

    const token = this.generateJwt(user.id, user.role);

    return { token, expires: 86400 };
  }

  private async hashPasssword(password: string): Promise<string> {
    const salt = process.env.SALT_ROUNDS;
    return new Promise((resolve, reject) => {
      hash(password, parseInt(salt), (err, hash) => {
        if (err) return reject('Failure on hashing password.\n' + err);
        resolve(hash);
      });
    });
  }

  private async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      compare(password, hash, (err, result) => {
        if (err) reject(false);
        resolve(result);
      });
    });
  }

  private generateJwt(id: string, role: string): string {
    const payload = { id, role };
    const secretKey = process.env.SECRET;
    const expiresIn = '24h';

    return jwt.sign(payload, secretKey, { expiresIn });
  }
}
