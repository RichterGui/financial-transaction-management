import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWalletDto } from './dto/createWallet.dto';

@Injectable()
export class WalletsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createWalletDto: CreateWalletDto, userId: string) {
    try {
      const existingWallet = await this.prisma.wallet.findFirst({
        where: {
          name: createWalletDto.name,
          userId: userId,
        },
      });

      if (existingWallet) {
        throw new HttpException(
          'A wallet with this name already exists for the user.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const wallet = await this.prisma.wallet.create({
        data: {
          name: createWalletDto.name,
          userId: userId,
        },
      });

      if (!wallet) {
        throw new HttpException(
          'Failet to create a new wallet.',
          HttpStatus.BAD_REQUEST,
        );
      }
      return wallet;
    } catch (error) {
      throw error;
    }
  }

  async findAll(userId: string) {
    const wallets = await this.prisma.wallet.findMany({
      where: { userId },
    });

    if (!wallets) {
      throw new HttpException(
        'Failet to found wallets for this user.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return wallets;
  }

  async findOne(userId: string, walletId: number) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new HttpException('Wallet not found.', HttpStatus.NOT_FOUND);
    }

    if (wallet.userId !== userId) {
      throw new HttpException('Access denied.', HttpStatus.FORBIDDEN);
    }

    return wallet;
  }

  async updateName(userId: string, walletId: number, name: string) {
    // using findOne method because it already have the validations inside.
    await this.findOne(userId, walletId);

    const updatedWallet = await this.prisma.wallet.update({
      where: { id: walletId },
      data: {
        name: name,
        updatedAt: new Date(),
      },
    });

    if (!updatedWallet) {
      throw new HttpException(
        'Cannot update the wallet name.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return updatedWallet;
  }

  async remove(userId: string, walletId: number) {
    const wallet = await this.findOne(userId, walletId);

    if (wallet.balance !== 0) {
      throw new HttpException(
        'Cannot remove the wallet, its not empty.',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    await this.prisma.wallet.delete({
      where: { id: walletId },
    });

    throw new HttpException('Removed successfully', HttpStatus.OK);
  }

  async addBalance(walletId: number, amount: number) {
    if (amount <= 0) {
      throw new HttpException(
        'Amount must be greater than zero.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const wallet = await this.prisma.wallet.update({
      where: { id: walletId },
      data: {
        balance: { increment: amount },
        updatedAt: new Date(),
      },
    });

    return wallet;
  }

  async subtractBalance(walletId: number, amount: number) {
    if (amount <= 0) {
      throw new HttpException(
        'Amount must be greater than zero.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new HttpException('Wallet not found.', HttpStatus.NOT_FOUND);
    }

    if (wallet.balance < amount) {
      throw new HttpException('Insufficient balance.', HttpStatus.BAD_REQUEST);
    }

    return await this.prisma.wallet.update({
      where: { id: walletId },
      data: {
        balance: { decrement: amount },
        updatedAt: new Date(),
      },
    });
  }
}
