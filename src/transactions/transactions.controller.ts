import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/CreateTransactionDto';
import { JwtGuard } from 'src/auth/jwt.guard';

@Controller('transactions')
@UseGuards(JwtGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async create(@Req() req, @Body() createTransactionDto: CreateTransactionDto) {
    const userId = req.user.id;
    return this.transactionsService.create(createTransactionDto, userId);
  }

  @Get('user/:walletId?')
  async findAll(@Req() req, @Param('walletId') walletId?: number) {
    const userId = req.user.id;
    return this.transactionsService.findAll(userId, walletId);
  }

  @Delete(':transactionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelTransaction(
    @Req() req,
    @Param('transactionId') transactionId: number,
  ) {
    const userId = req.user.id;
    return this.transactionsService.cancelTransaction(transactionId, userId);
  }

  @Get('report')
  async getReport(
    @Req() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const userId = req.user.id;
    return this.transactionsService.getReport(startDate, endDate, userId);
  }

  @Get('all')
  async getAllTransactions(@Req() req) {
    const role = req.user.role;

    if (role === 'user') {
      throw new HttpException('Route for admins only.', HttpStatus.FORBIDDEN);
    }

    return this.transactionsService.getAllTransactions();
  }
}
