import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { WalletsService } from 'src/wallets/wallets.service';
import { CreateTransactionDto } from './dto/CreateTransactionDto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletsService: WalletsService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto, userId: string) {
    const { type, amount, category, sourceWalletId, targetWalletId } =
      createTransactionDto;

    if (amount <= 0) {
      throw new HttpException(
        'Amount must be greater than zero.',
        HttpStatus.BAD_REQUEST,
      );
    }

    let sourceWallet, targetWallet;

    const transaction = await this.prisma.$transaction(async (prisma) => {
      switch (type) {
        case 'transfer':
          sourceWallet = await this.walletsService.findOne(
            userId,
            sourceWalletId,
          );
          targetWallet = await this.walletsService.findOne(
            userId,
            targetWalletId,
          );

          if (sourceWallet.balance < amount) {
            throw new HttpException(
              'Insufficient balance in the source wallet.',
              HttpStatus.BAD_REQUEST,
            );
          }

          await this.walletsService.subtractBalance(sourceWalletId, amount);
          await this.walletsService.addBalance(targetWalletId, amount);
          break;
        case 'expense':
          sourceWallet = await this.walletsService.findOne(
            userId,
            sourceWalletId,
          );

          if (sourceWallet.balance < amount) {
            throw new HttpException(
              'Insufficient balance in the wallet',
              HttpStatus.BAD_REQUEST,
            );
          }

          await this.walletsService.subtractBalance(sourceWalletId, amount);
          break;
        case 'income':
          sourceWallet = await this.walletsService.findOne(
            userId,
            sourceWalletId,
          );
          await this.walletsService.addBalance(sourceWalletId, amount);
          break;
        default:
          break;
      }

      return await prisma.transaction.create({
        data: {
          type,
          amount,
          category,
          sourceWallet: sourceWallet
            ? { connect: { id: sourceWalletId } }
            : undefined,
          targetWallet: targetWallet
            ? { connect: { id: targetWalletId } }
            : undefined,
          user: { connect: { id: userId } },
        },
      });
    });

    return transaction;
  }

  async findAll(userId: string, walletId?: number) {
    let transactions;

    if (walletId) {
      transactions = await this.prisma.transaction.findMany({
        where: { userId: userId, sourceWalletId: walletId },
        include: {
          sourceWallet: true,
          targetWallet: true,
        },
      });
    } else {
      transactions = await this.prisma.transaction.findMany({
        where: { userId },
        include: {
          sourceWallet: true,
          targetWallet: true,
        },
      });
    }

    if (!transactions) {
      throw new HttpException('Transactions not found', HttpStatus.BAD_REQUEST);
    }

    return transactions;
  }

  async cancelTransaction(transactionId: number, userId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { sourceWallet: true, targetWallet: true },
    });

    if (!transaction) {
      throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
    }

    if (transaction.userId !== userId) {
      throw new HttpException(
        'You are not authorized to cancel this transaction',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.prisma.$transaction(async (prisma) => {
      switch (transaction.type) {
        case 'transfer':
          await this.walletsService.addBalance(
            transaction.sourceWallet.id,
            transaction.amount,
          );
          await this.walletsService.subtractBalance(
            transaction.targetWallet.id,
            transaction.amount,
          );
          break;
        case 'expense':
          await this.walletsService.addBalance(
            transaction.sourceWallet.id,
            transaction.amount,
          );
          break;
        case 'income':
          await this.walletsService.subtractBalance(
            transaction.sourceWallet.id,
            transaction.amount,
          );
          break;
        default:
          break;
      }

      await prisma.transaction.delete({
        where: { id: transactionId },
      });
    });

    throw new HttpException('Transaction successfully canceled', HttpStatus.OK);
  }

  async getReport(startDate: string, endDate: string, userId: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      throw new HttpException(
        'The start date must be earlier than the end date.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    const report = {
      totalIncome: 0,
      totalExpenses: 0,
    };

    for (const transaction of transactions) {
      if (transaction.type === 'income') {
        report.totalIncome += transaction.amount;
      } else if (transaction.type === 'expense') {
        report.totalExpenses += transaction.amount;
      }
    }

    return report;
  }

  async getAllTransactions() {
    return await this.prisma.transaction.findMany();
  }
}
