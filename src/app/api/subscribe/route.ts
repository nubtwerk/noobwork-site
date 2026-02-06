import { NextRequest, NextResponse } from "next/server";

const FORMS: Record<string, { formId?: string; apiKey?: string }> = {
  newsletter: {
    formId: process.env.KIT_FORM_ID_NEWSLETTER,
    apiKey: process.env.KIT_API_KEY_NEWSLETTER,
  },
  "media-kit": {
    formId: process.env.KIT_FORM_ID_MEDIA_KIT,
    apiKey: process.env.KIT_API_KEY_MEDIA_KIT,
  },
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

  if (!formId || !(formId in FORMS)) {
    return NextResponse.json({ error: "Invalid form ID" }, { status: 400 });
  }

  const { formId: kitFormId, apiKey } = FORMS[formId];
  if (!kitFormId || !apiKey) {
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
