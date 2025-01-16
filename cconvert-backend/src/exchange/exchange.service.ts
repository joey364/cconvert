import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { RatesResponse } from 'src/exchange/dto/rates.response.dto';
import { ConvertRequest } from 'src/exchange/dto/convert.request.dto';
import { PrismaService } from 'src/prisma.service';
import { ConvertResponse } from 'src/exchange/dto/convert.response.dto';

@Injectable()
export class ExchangeService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  #API_BASE_URL = this.config.get('EXCHANGE_API_BASE_URL');
  #API_APP_ID = this.config.get('APP_ID');

  async getExchangeRates() {
    const response = await axios.get(
      `${this.#API_BASE_URL}/latest.json?app_id=${this.#API_APP_ID}`,
    );
    const ratesResponse = new RatesResponse();

    ratesResponse.baseCurrency = response.data.base;
    ratesResponse.rates = response.data.rates;

    return ratesResponse;
  }

  async convert(request: ConvertRequest, userId: string) {
    const { rates } = await this.getExchangeRates();

    const rate = rates[request.toCurrency] / rates[request.fromCurrency];
    const convertedValue = rate * request.amount;

    await this.prisma.transaction.create({
      data: { ...request, userId, convertedAmount: convertedValue },
    });

    const response = new ConvertResponse();
    response.amount = request.amount;
    response.toCurrency = request.toCurrency;
    response.fromCurrency = request.fromCurrency;
    response.convertedValue = convertedValue;

    return response;
  }
}
