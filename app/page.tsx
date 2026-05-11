// app/page.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black p-6">
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-5xl font-extrabold tracking-tight lg:text-7xl">
          Next-Gen <br className="hidden sm:block"/> Attendance System
        </h1>
        <p className="text-lg text-zinc-600 max-w-xl mx-auto">
          Secure, automated, and seamless. Manage university attendance using QR technology and facial verification.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="w-full bg-black text-white hover:bg-zinc-800">
              Get Started
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full border-black text-black hover:bg-zinc-100">
              Log In
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}