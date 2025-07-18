'use client';

import { ThemeProvider } from "../app/context/ThemeContext";
import Header from "@/components/ui/Header";

interface ClientWrapperProps {
  children: React.ReactNode;
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
        <Header />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}