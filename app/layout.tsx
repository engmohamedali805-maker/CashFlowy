
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CashFlowy – فلوسك تحت السيطرة",
  description: "تطبيق شامل لإدارة الثروة والميزانية",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="antialiased bg-gray-50 font-['Cairo']">
        {children}
      </body>
    </html>
  );
}
