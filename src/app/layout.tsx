import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { UserProvider } from "@/context/UserContext";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TechWave",
  description: "A social media platform for developers and tech enthusiasts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body className={poppins.className}>
        <UserProvider>
          <div className="mx-auto max-w-screen-lg rounded-md border-grey md:border">
            {children}
            <Toaster />
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
