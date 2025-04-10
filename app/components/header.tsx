"use client";

import { ConnectWallet } from "@coinbase/onchainkit/wallet";
import { useAccount, useDisconnect } from "wagmi";

export default function Header() {
  const { isConnected } = useAccount(); // Removed 'address'
  const { disconnect } = useDisconnect();

  return (
    <header className="w-full bg-[var(--black)] text-white p-2 flex items-center justify-between fixed top-0 z-10">
      <div
        onClick={() => window.open("https://mintbay.vercel.app/", "_blank")}
        className="text-lg cursor-pointer hover:text-[var(--gray-300)] transition-colors"
      >
        [mintbay]
      </div>
      {isConnected ? (
        <button
          onClick={() => disconnect()}
          className="px-2 py-1 text-sm text-white bg-red-500 hover:bg-red-600 rounded"
        >
          Disconnect
        </button>
      ) : (
        <ConnectWallet className="wallet-btn" />
      )}
    </header>
  );
}