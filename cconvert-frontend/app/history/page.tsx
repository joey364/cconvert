"use client"

import { useLazyGetUserTransactionsQuery } from "@/api/cconvert-api";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function History() {
  const [page, setPage] = useState(1)
  const limit = 10

  const authToken = useSelector((state: RootState) => state.auth.token)
  const [getTransactions, { data }] = useLazyGetUserTransactionsQuery()

  useEffect(() => {
    if (!authToken) {
      redirect('/')
    }

    getTransactions({ page, limit })
  }, [authToken, page, getTransactions])


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
            {data && data.data.map((record, index) => (
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

        <div className="mx-auto flex w-full justify-start pt-6">
          <div className="flex flex-row items-center gap-2">
            <Button disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span>Page {page}</span>
            <Button
              disabled={data && data.totalItems < limit}
              onClick={() => setPage((prev) => prev + 1)}
            >

              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}

