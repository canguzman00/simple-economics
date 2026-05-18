import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}
