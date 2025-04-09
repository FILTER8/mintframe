"use client";

import { ConnectWallet } from "@coinbase/onchainkit/wallet";

export default function Header() {
  return (
    <header className="w-full bg-[var(--black)] text-white p-2 flex items-center justify-between fixed top-0 z-10">
      <div
        onClick={() => window.open("https://mintbay.vercel.app/", "_blank")}
        className="text-lg cursor-pointer hover:text-[var(--gray-300)] transition-colors"
      >
        [mintbay]
      </div>
      <ConnectWallet className="wallet-btn" />
    </header>
  );
}