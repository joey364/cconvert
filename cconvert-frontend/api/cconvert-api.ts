// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '@/redux/slices/store'
import { FormData } from '@/app/login/page';
import { generateNonce } from '@/lib/utils';

export interface ExchangeRateResponse {
  rates: { [key: string]: number };
  base: string;
}

export interface LoginResponse {
  token: string
}

export interface PaginationDto<T> {
  page: number
  limit: number
  totalItems: number
  data: T[]
}

export interface TransactionResponse {
  id: string
  fromCurrency: string
  toCurrency: string
  amount: number
  convertedAmount: number
  timestamp: string
}

export interface ConvertRequest {
  fromCurrency: string
  toCurrency: string
  amount: number
}
export interface ConvertResponse extends ConvertRequest {
  convertedValue: number
}

export const cconvertApi = createApi({
  reducerPath: 'cconvertApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_CCONVERT_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      headers.set('x-cconvert-nonce', generateNonce())
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },

  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, FormData>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    convert: builder.mutation<ConvertResponse, ConvertRequest>({
      query: (data) => ({
        url: '/convert',
        method: 'POST',
        body: data,
      }),
    }),

    getExchangeRates: builder.query<ExchangeRateResponse, void>({
      query: () => `/exchange-rates`
    }),

    getUserTransactions: builder.query<PaginationDto<TransactionResponse>, { page: number, limit: number }>({
      query: ({ page = 1, limit = 10 }) => `/user/transactions?page=${page}&limit=${limit}`
    })
  })

})

export const { useLoginMutation, useGetExchangeRatesQuery, useLazyGetUserTransactionsQuery, useConvertMutation } = cconvertApi