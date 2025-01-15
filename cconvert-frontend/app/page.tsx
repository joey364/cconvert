"use client"

import { ConvertRequest, useConvertMutation } from "@/api/cconvert-api";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RootState } from "@/redux/slices/store";
import { redirect } from "next/navigation";
import * as yup from 'yup'
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useToast } from "@/hooks/use-toast";


const convertRequestSchema = yup.object().shape({
  fromCurrency: yup.string()
    .min(3, "invalid country ISO code")
    .max(3, "invalid country ISO code")
    .required("fromCurrency is required"),
  toCurrency: yup.string()
    .min(3, "invalid country ISO code")
    .max(3, "invalid country ISO code")
    .required("toCurrency is required"),
  amount: yup.number().min(1)
    .required()
});

export default function Home() {
  const [amount, setAmount] = useState(1)
  const [result, setResult] = useState<null | number>(null)
  const [fromCurrency, setFromCurrency] = useState('')
  const [toCurrency, setToCurrency] = useState('')
  const [convert, { isError }] = useConvertMutation()

  const { toast } = useToast()

  const handleConvert = async () => {
    const requestBody: ConvertRequest = {
      fromCurrency,
      toCurrency,
      amount
    }
    try {
      await convertRequestSchema.validate(requestBody)
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        toast({
          title: 'Oops!',
          description: err.message ?? "Something went wrong!",
          variant: "destructive"
        })
      }
    }

    const response = await convert(requestBody)

    if (response.data) {
      setResult(response.data.convertedValue)
    }

    if (isError) {
      toast({
        title: 'Oops!',
        description: "Something went wrong!",
        variant: "destructive"
      })
    }


  }

  const authToken = useSelector((state: RootState) => state.auth.token)
  const supportedCurrencies = useSelector((state: RootState) => state.currencies)

  const availableCurrencies = supportedCurrencies.currencies ?? ["USD", "GBP", "JPY"];

  useEffect(() => {
    if (!authToken) {
      redirect('/login')
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto mt-8 p-4">
        <h1 className="text-3xl font-bold mb-6">Currency Converter</h1>
        <div className="grid gap-4 max-w-md mx-auto">
          <Input
            type="number"
            min={1}
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="From" />
              </SelectTrigger>
              <SelectContent>
                {availableCurrencies.map((currency: string) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="To" />
              </SelectTrigger>
              <SelectContent>
                {availableCurrencies.map((currency: string) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleConvert}>Convert</Button>
          {result && (
            <div className="text-center text-xl mt-4">
              {amount} {fromCurrency} = {result.toFixed(2)} {toCurrency}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
