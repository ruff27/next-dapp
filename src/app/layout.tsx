import "./globals.css";
import Providers from "./providers";
import Header from "./components/Header";

export const metadata = {
  title: "Next Dapp",
  description: "Hello-chain starter (Next.js + wagmi + RainbowKit)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-zinc-100">
        <Providers>
          <Header />
          <main className="mx-auto max-w-6xl px-4 py-10">
            <div className="mx-auto max-w-lg">{children}</div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
