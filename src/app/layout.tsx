import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: "EduPortal — Excellence in Education",
    template: "%s | EduPortal",
  },
  description:
    "EduPortal is a leading academic institution offering world-class programs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn("h-full", "font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col antialiased bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
