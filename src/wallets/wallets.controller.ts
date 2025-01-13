import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/createWallet.dto';
import { JwtGuard } from 'src/auth/jwt.guard';

@Controller('wallets')
@UseGuards(JwtGuard)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  async create(@Req() req, @Body() createWalletDto: CreateWalletDto) {
    const userId = req.user.id;
    return this.walletsService.create(createWalletDto, userId);
  }

  @Get()
  async findAll(@Req() req) {
    const userId = req.user.id;
    return this.walletsService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Req() req, @Param('id') id: number) {
    const userId = req.user.id;
    return this.walletsService.findOne(userId, id);
  }

  @Patch(':id')
  async updateName(
    @Req() req,
    @Param('id') id: number,
    @Body('name') name: string,
  ) {
    const userId = req.user.id;
    return this.walletsService.updateName(userId, id, name);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Req() req, @Param('id') id: number) {
    const userId = req.user.id;
    return this.walletsService.remove(userId, id);
  }
}
