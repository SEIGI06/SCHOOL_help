import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "School Revision App",
    description: "AI-powered revision tool for students",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" className="h-full">
            <body className="h-full antialiased">
                {children}
            </body>
        </html>
    );
}
