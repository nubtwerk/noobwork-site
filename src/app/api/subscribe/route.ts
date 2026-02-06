import { NextRequest, NextResponse } from "next/server";

const FORM_IDS: Record<string, string | undefined> = {
  newsletter: process.env.KIT_FORM_ID_NEWSLETTER,
  "media-kit": process.env.KIT_FORM_ID_MEDIA_KIT,
};

export async function POST(request: NextRequest) {
  let body: { email?: string; formId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, formId } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (!formId || !(formId in FORM_IDS)) {
    return NextResponse.json({ error: "Invalid form ID" }, { status: 400 });
  }

  const kitFormId = FORM_IDS[formId];
  if (!kitFormId) {
    return NextResponse.json(
      { error: "Subscription is not configured" },
      { status: 500 }
    );
  }

  const apiKey = process.env.KIT_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Subscription is not configured" },
      { status: 500 }
    );
  }

  const res = await fetch(
    `https://api.convertkit.com/v3/forms/${kitFormId}/subscribe`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: apiKey, email }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Kit API error:", res.status, text);
    return NextResponse.json(
      { error: "Subscription failed. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}
