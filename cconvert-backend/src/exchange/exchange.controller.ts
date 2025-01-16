import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { ExchangeService } from './exchange.service';
import { ConvertRequest } from 'src/exchange/dto/convert.request.dto';
import { User } from 'src/users/user.decorator';

@Controller()
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @Get('exchange-rates')
  async getExchangeRates() {
    return this.exchangeService.getExchangeRates();
  }

  @UseGuards(AuthGuard)
  @Post('convert')
  async convertCurrency(@Body() request: ConvertRequest, @User() user) {
    return this.exchangeService.convert(request, user.userId);
  }
}
