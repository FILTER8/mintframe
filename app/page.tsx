"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount, useReadContracts, useSwitchChain, useWriteContract } from "wagmi";
import Image from "next/image";
import Header from "./components/header";
import factoryAbi from "./contracts/MintbayEditionFactory.json";
import editionAbi from "./contracts/MintbayEdition.json";

const FACTORY_ADDRESS = "0x61Ab3bc8372B97f3e88a6D400cB056a46BC42C17";
const INITIAL_VISIBLE = 6; // Initial 6 images (2 per row, 3 rows)
const LAUNCHPAD_FEE = "0.0004"; // Fixed fee as per [id].tsx

export default function Home() {
  const [selectedNft, setSelectedNft] = useState<string | null>(null);
  const [visibleEditions, setVisibleEditions] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  useAccount(); // Keep for wallet context, even if not destructured
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { data: allEditions } = useReadContracts({
    contracts: [{
      address: FACTORY_ADDRESS as `0x${string}`,
      abi: factoryAbi.abi,
      functionName: "getAllEditions",
      chainId: 84532,
    }],
  }) as { data: { result: string[] }[] | undefined };

  useEffect(() => {
    if (allEditions && allEditions[0]?.result) {
      const editionsArray = Array.isArray(allEditions[0].result) ? allEditions[0].result : [];
      const reversedEditions = [...editionsArray].reverse(); // Latest first
      setVisibleEditions(reversedEditions.slice(0, INITIAL_VISIBLE * page));
    }
  }, [allEditions, page]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && allEditions && allEditions[0]?.result && visibleEditions.length < allEditions[0].result.length) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [visibleEditions, allEditions]);

  return (
    <div className="flex justify-center min-h-screen">
      <div className="w-full bg-[var(--background)] text-[var(--foreground)] flex flex-col">
        <Header />
        {selectedNft ? (
          <div className="w-full max-w-[512px] mx-auto">
            <DetailPage address={selectedNft} setSelectedNft={setSelectedNft} />
          </div>
        ) : (
          <div className="w-full max-w-[512px] mx-auto flex flex-col items-center pt-10 pb-2 overflow-y-auto max-h-[600px]">
            {visibleEditions.length === 0 ? (
              <p className="text-sm text-[var(--gray-500)] text-center mt-4 animate-fade-in">Loading editions...</p>
            ) : (
              <div className="mt-8 w-[304px] flex flex-wrap justify-center gap-0 mx-auto">
                {visibleEditions.map((address) => (
                  <div key={address} onClick={() => setSelectedNft(address)} className="w-[144px] cursor-pointer animate-fade-in">
                    <NFTImage address={address} tokenId={1} scale={1} />
                  </div>
                ))}
              </div>
            )}
            <div ref={loadMoreRef} className="h-4" />
          </div>
        )}
        <footer className="w-full p-2 flex flex-col items-center fixed bottom-0 bg-[var(--background)] z-10">
          <hr className="border-t-8 border-gray-900 w-full mb-2" />
          <button
            className="px-2 py-1 text-xs text-[var(--foreground)] border border-[var(--gray-500)] hover:bg-[var(--gray-300)] active:bg-[var(--gray-500)] transition-colors opacity-60"
            onClick={() => window.open("https://mintbay.vercel.app/", "_blank")}
          >
            [visit mintbay]
          </button>
        </footer>
      </div>
    </div>
  );
}

function DetailPage({ address, setSelectedNft }: { address: string; setSelectedNft: (val: string | null) => void }) {
  const { address: walletAddress } = useAccount();
  const { switchChain } = useSwitchChain();
  const { data: contractData, isLoading } = useReadContracts({
    contracts: [
      { address: address as `0x${string}`, abi: editionAbi.abi, functionName: "name", chainId: 84532 },
      { address: address as `0x${string}`, abi: editionAbi.abi, functionName: "price", chainId: 84532 },
      { address: address as `0x${string}`, abi: editionAbi.abi, functionName: "editionSize", chainId: 84532 },
      { address: address as `0x${string}`, abi: editionAbi.abi, functionName: "nextTokenId", chainId: 84532 },
      { address: address as `0x${string}`, abi: editionAbi.abi, functionName: "isFreeMint", chainId: 84532 },
      { address: address as `0x${string}`, abi: editionAbi.abi, functionName: "whitelistCount", chainId: 84532 },
      { address: address as `0x${string}`, abi: editionAbi.abi, functionName: "getWhitelist", chainId: 84532 },
      { address: address as `0x${string}`, abi: editionAbi.abi, functionName: "maxMintPerAddress", chainId: 84532 },
      { address: address as `0x${string}`, abi: editionAbi.abi, functionName: "mintCount", args: [walletAddress], chainId: 84532 },
    ],
    query: { enabled: !!walletAddress },
  });

  const [
    nameData,
    priceData,
    editionSizeData,
    nextTokenIdData,
    isFreeMintData,
    whitelistCountData,
    whitelistData,
    maxMintPerAddressData,
    mintCountData,
  ] = contractData || [];

  const { writeContract, data: txHash, error: writeError, isLoading: isWriting } = useWriteContract();

  const name = nameData?.result as string | undefined;
  const price = priceData?.result ? Number(priceData.result) / 1e18 : 0;
  const editionSize = editionSizeData?.result ? Number(editionSizeData.result) : Infinity;
  const minted = nextTokenIdData?.result ? Number(nextTokenIdData.result) - 1 : 0;
  const isFreeMint = isFreeMintData?.result as boolean | undefined;
  const whitelistCount = whitelistCountData?.result ? Number(whitelistCountData.result) : 0;
  const whitelist = whitelistData?.result as string[] | undefined;
  const maxMintPerAddress = maxMintPerAddressData?.result ? Number(maxMintPerAddressData.result) : Infinity;
  const mintCount = mintCountData?.result ? Number(mintCountData.result) : 0;

  const baseCost = isFreeMint ? 0 : price;
  const totalCost = baseCost + Number(LAUNCHPAD_FEE);
  const isSoldOut = minted >= editionSize;
  const maxMintAllowed = Math.max(0, maxMintPerAddress - mintCount);
  const isMaxMintReached = maxMintAllowed === 0;
  const isPublicMint = whitelistCount === 0;

  const hasWhitelistToken = isPublicMint; // Placeholder

  const canCollect = isPublicMint || hasWhitelistToken;

const handleCollect = async () => {
  if (!walletAddress) return;
  try {
    console.log("Switching to Base Sepolia...");
    await switchChain({ chainId: 84532 });
    console.log("Chain switched, preparing transaction...");
    const totalCostWei = BigInt(Math.round(totalCost * 1e18));
    console.log("Total cost (wei):", totalCostWei.toString());
    console.log("Minting to contract:", address);
    console.log("Wallet address:", walletAddress);
    await writeContract({
      address: address as `0x${string}`,
      abi: editionAbi.abi,
      functionName: "collectBatch",
      args: [BigInt(1)],
      value: totalCostWei,
    });
    console.log("Transaction sent, awaiting confirmation...");
  } catch (error) {
    console.error("Error in handleCollect:", error);
  }
};

  const handleWhitelistLink = () => {
    if (whitelist && whitelist.length > 0) {
      window.open(`https://mintbay.vercel.app/token/${whitelist[0]}`, "_blank");
    }
  };

  return (
    <div className="w-full p-2 flex flex-col items-center pt-10 pb-8">
      <button
        onClick={() => setSelectedNft(null)}
        className="text-sm mt-4 mb-2 text-[var(--gray-700)] hover:text-[var(--foreground)] transition-colors"
      >
        [back to gallery]
      </button>
      <div
        className="border bg-white shadow hover:shadow-lg flex flex-col justify-between p-4"
        style={{ width: "320px", height: "354px" }}
      >
        <div className="flex items-center justify-center mx-auto" style={{ width: "288px", height: "288px" }}>
          <NFTImage address={address} tokenId={1} scale={2} key={address} />
        </div>
        <div className="flex flex-col items-center mt-2 w-full text-xs text-gray-700 font-mono">
          <h1 className="text-sm font-bold truncate w-full text-center">{name || "Loading..."}</h1>
          <span>Supply: {minted}/{editionSize === Infinity ? "∞" : editionSize}</span>
        </div>
      </div>
      {isLoading || !nameData ? (
        <p className="text-sm mt-2 text-[var(--gray-500)] animate-fade-in">Loading...</p>
      ) : (
        <div className="mt-4 text-center animate-fade-in space-y-2">
          {isSoldOut ? (
            <button className="w-[320px] bg-gray-300 text-gray-700 py-2 px-4 text-sm" disabled>
              Sold Out
            </button>
          ) : (
            <>
              <button
                onClick={handleCollect}
                className={`w-[320px] py-2 px-4 text-sm text-white ${isFreeMint ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"} disabled:bg-gray-400`}
                disabled={!walletAddress || !canCollect || isMaxMintReached || isWriting}
              >
                {isFreeMint ? `Free (${baseCost.toFixed(4)} ETH)` : `Collect (${baseCost.toFixed(4)} ETH)`}
              </button>
              <div className="text-xs text-gray-500 flex items-center justify-center space-x-1">
                <span>+ {LAUNCHPAD_FEE} ETH fee</span>
                <span className="relative group">
                  ⓘ
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded w-48">
                    Mintbay charges a small fee for each token minted to run our service.
                  </span>
                </span>
              </div>
              {isMaxMintReached && maxMintPerAddress !== Infinity && (
                <p className="text-xs text-red-500">Max mint {maxMintPerAddress} per wallet reached</p>
              )}
              {!canCollect && whitelistCount > 0 && whitelist && whitelist.length > 0 && (
                <p className="text-xs text-red-500">
                  Requires token from{" "}
                  <button
                    onClick={handleWhitelistLink}
                    className="underline text-red-500 hover:text-red-700 focus:outline-none"
                  >
                    whitelisted contract
                  </button>
                </p>
              )}
            </>
          )}
          {isWriting && <p className="text-xs mt-2 text-yellow-500">Minting in progress...</p>}
          {txHash && <p className="text-xs mt-2 text-green-600">[Collected! Tx: {txHash.slice(0, 6)}...]</p>}
          {writeError && <p className="text-xs mt-2 text-red-500">Error: {writeError.message}</p>}
        </div>
      )}
    </div>
  );
}

function NFTImage({ address, tokenId, scale }: { address: string; tokenId: number; scale: 1 | 2 }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const size = 144 * scale;

  const { data: tokenURI } = useReadContracts({
    contracts: [{
      address: address as `0x${string}`,
      abi: editionAbi.abi,
      functionName: "tokenURI",
      args: [tokenId],
      chainId: 84532,
    }],
  });

  useEffect(() => {
    if (!tokenURI || !tokenURI[0]?.result) return;
    const processURI = async () => {
      try {
        let metadata;
        const uri = tokenURI[0].result as string;
        if (uri.startsWith("data:application/json;base64,")) {
          const base64Data = uri.split(",")[1];
          metadata = JSON.parse(atob(base64Data));
        } else if (uri.startsWith("http")) {
          const res = await fetch(uri);
          metadata = await res.json();
        }
        setImageSrc(metadata?.image || null);
      } catch (err) {
        console.error("Failed to process URI:", err);
        setImageSrc(null);
      }
    };
    processURI();
  }, [tokenURI]);

  if (!imageSrc) {
    return (
      <div className="bg-[var(--gray-300)] flex items-center justify-center animate-fade-in" style={{ width: size, height: size }}>
        <span className="text-[var(--gray-500)] text-xs">Loading...</span>
      </div>
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={`NFT ${tokenId}`}
      width={size}
      height={size}
      className="object-contain animate-fade-in"
    />
  );
}