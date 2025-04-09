import { NextResponse } from "next/server";

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL;

  return NextResponse.json({
    accountAssociation: {
      header: process.env.FARCASTER_HEADER,
      payload: process.env.FARCASTER_PAYLOAD,
      signature: process.env.FARCASTER_SIGNATURE,
    },
    frame: {
      version: process.env.NEXT_PUBLIC_VERSION || "next",
      name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "mintbay",
      homeUrl: URL || "https://mintbay-frame.vercel.app/",
      iconUrl: process.env.NEXT_PUBLIC_ICON_URL || "https://filter8.xyz/wp-content/uploads/2025/04/mintbay_icon.png",
      imageUrl: process.env.NEXT_PUBLIC_IMAGE_URL || "https://filter8.wordpress.com/wp-content/uploads/2025/04/mintbay-minikit-frame-1.png",
      buttonTitle: `Launch ${process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "mintbay"}`,
      splashImageUrl: process.env.NEXT_PUBLIC_SPLASH_IMAGE_URL || "https://filter8.xyz/wp-content/uploads/2025/04/mintbay_icon.png",
      splashBackgroundColor: `#${process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || "FFFFFF"}`,
      webhookUrl: `${URL || "https://mintbay-frame.vercel.app"}/api/webhook`,
    },
  });
}