import type { Metadata } from "next";
import "./globals.css";
import { DatasetProvider } from "@/components/DatasetContext";

export const metadata: Metadata = {
  title: "DataPilot",
  description: "Autonomous AI-powered business intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <DatasetProvider>
          {children}
        </DatasetProvider>
      </body>
    </html>
  );
}