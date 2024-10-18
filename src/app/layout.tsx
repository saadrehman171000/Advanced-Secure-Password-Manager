import { ClerkProvider, ClerkLoaded } from '@clerk/nextjs'
import type { Metadata } from "next"
import "./globals.css"
import Navbar from '@/components/Navbar'
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "SecureVault - Password Manager",
  description: "A secure and user-friendly password manager application",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Navbar />
          <ClerkLoaded>{children}</ClerkLoaded>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}