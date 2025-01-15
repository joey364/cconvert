import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navigation() {
  return (
    <nav className="flex justify-between items-center p-4 bg-secondary">
      <Link href="/" className="text-2xl font-bold">
        cconvert
      </Link>
      <div>
        <Button variant="ghost" asChild className="mr-2">
          <Link href="/">Convert</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/history">History</Link>
        </Button>
      </div>
    </nav>
  )
}

