import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateTransactionDto {
  @IsEnum(['income', 'expense', 'transfer'], {
    message: "Type must be 'income', 'expense', or 'transfer'",
  })
  type: 'income' | 'expense' | 'transfer';

  @IsNumber()
  @IsPositive({ message: 'Amount must be a positive number' })
  amount: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsNumber()
  @IsPositive({ message: 'Source wallet ID must be a positive number' })
  sourceWalletId: number;

  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'Target wallet ID must be a positive number' })
  targetWalletId?: number;
}
