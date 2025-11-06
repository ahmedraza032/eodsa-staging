import { NextRequest, NextResponse } from "next/server";
import { verifyRecaptcha } from "@/lib/recaptcha";

export async function GET(request: NextRequest) {
  // Only enabled in non-production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  const config = {
    publicKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "not_set",
    hasSecretKey: !!process.env.RECAPTCHA_SECRET_KEY,
    environment: process.env.NODE_ENV,
    // Test verification with a known invalid token
    verificationTest: await verifyRecaptcha("test_token"),
  };

  return NextResponse.json(config);
}
