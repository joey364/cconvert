"use client"

import { useGetUserTransactionsQuery } from "@/api/cconvert-api";
import { Navigation } from "@/components/navigation";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RootState } from "@/redux/slices/store";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function History() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const authToken = useSelector((state: RootState) => state.auth.token)
  const { data } = useGetUserTransactionsQuery({ page, limit })

  useEffect(() => {
    if (!authToken) {
      redirect('/')
    }
  }, [])


  return (
    <>
      <Navigation />
      <main className="container mx-auto mt-8 p-4">
        <h1 className="text-3xl font-bold mb-6">Conversion History</h1>
        <Table>
          {!data && (<TableCaption>A list of your recent conversions.</TableCaption>)}
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>From</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.map((record, index) => (
              <TableRow key={index}>
                <TableCell>{record.id}</TableCell>
                <TableCell>{record.fromCurrency}</TableCell>
                <TableCell>{Number(record.amount).toFixed(2)}</TableCell>
                <TableCell>{record.toCurrency}</TableCell>
                <TableCell>{Number(record.convertedAmount).toFixed(2)}</TableCell>
                <TableCell>{new Date(record.timestamp).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </main>
    </>
  );
}

