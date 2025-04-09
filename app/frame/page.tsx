import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mintbay Frame",
  description: "Mint NFTs on Base Sepolia",
  openGraph: {
    title: "Mintbay Frame",
    description: "Mint NFTs on Base Sepolia",
    images: [
      {
        url: "https://filter8.xyz/wp-content/uploads/2025/04/mintbay-minikit-frame-1.png",
        width: 1200,
        height: 1200, // Adjusted to match 1:1 aspect ratio
        alt: "Mintbay Frame Preview",
      },
    ],
  },
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "https://filter8.xyz/wp-content/uploads/2025/04/mintbay-minikit-frame-1.png",
    "fc:frame:image:aspect_ratio": "1:1",
    "fc:frame:button:1": "Launch Mintbay",
    "fc:frame:button:1:action": "link", // Changed to "link" for external URL
    "fc:frame:button:1:target": "https://mintframe-sigma.vercel.app/", // Points to your main app
  },
};

export default function FramePage() {
  return <p>Loading Mintbay Frame...</p>;
}