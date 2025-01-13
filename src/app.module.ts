import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';
import { WalletsService } from './wallets/wallets.service';
import { WalletsController } from './wallets/wallets.controller';
import { WalletsModule } from './wallets/wallets.module';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    AuthModule,
    TransactionsModule,
    WalletsModule,
  ],
  controllers: [AppController, WalletsController],
  providers: [AppService, WalletsService],
})
export class AppModule {}
