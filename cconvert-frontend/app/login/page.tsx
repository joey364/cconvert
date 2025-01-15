"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Info } from "lucide-react"
import { Tooltip, TooltipProvider } from "@radix-ui/react-tooltip"
import { TooltipContent, TooltipTrigger } from "../../components/ui/tooltip"
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from "react-hook-form"
import { useToast } from "@/hooks/use-toast"
import { useGetExchangeRatesQuery, useLoginMutation } from "@/api/cconvert-api"
import { useDispatch } from "react-redux"
import { setToken } from "@/redux/slices/auth.slice"
import { redirect } from 'next/navigation'
import { setSupportedCurrencies } from "@/redux/slices/currency.slice"

const schema = yup.object().shape({
  email: yup.string().email().required('Email is required'),
  password: yup.string().min(8).required('Password is required'),
});

export type FormData = {
  email: string;
  password: string;
};

export default function Login() {

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
  });
  const { toast } = useToast()

  const dispatch = useDispatch()

  const [login, { isError, isLoading }] = useLoginMutation()
  const { data: exchangeRateData } = useGetExchangeRatesQuery()


  const onSubmit = async (data: FormData) => {
    const response = await login(data)

    if (response.data && response.data.token) {
      dispatch(setToken(response.data.token))
      toast({
        title: "Success",
        description: "Login successful."
      })

      if (exchangeRateData) {
        dispatch(setSupportedCurrencies(Object.keys(exchangeRateData.rates)))
      }

      redirect('/')
    }

    if (isError) {
      let errorMessage = "Something went wrong!"
      if ((response.error as any).data.message) errorMessage = (response.error as any).data.message
      toast({
        title: "Oops!",
        description: errorMessage,
        variant: 'destructive'
      })
    }
  };


  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Enter your email below to login
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      {...register('email')}
                    />
                    {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <Input id="password" type="password" required {...register('password')} />
                    {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    Login
                  </Button>
                </div>
                <div className="pt-4 opacity-50 flex gap-2 text-sm items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipContent>
                        <p>Info</p>
                      </TooltipContent>
                      <TooltipTrigger asChild>
                        <Info size={24} />
                      </TooltipTrigger>
                    </Tooltip>
                  </TooltipProvider>
                  <p>This creates a new account if the email does not already exist.</p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
