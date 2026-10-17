import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "SG Partnerships — Intelligence into possibility",
  description: "A social intelligence workbench for better brand partnerships.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
