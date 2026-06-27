import { NextResponse } from "next/server";
import { parseContactPayload, sendContactEmail } from "@/lib/contact";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = parseContactPayload(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  // Honeypot trip — pretend success so bots do not retry variants.
  if (parsed.data.name === "spam") {
    return NextResponse.json({ ok: true });
  }

  try {
    await sendContactEmail(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message === "CONTACT_NOT_CONFIGURED") {
      return NextResponse.json(
        {
          error:
            "The contact form is not configured yet. Email joachim@noobwork.no directly.",
        },
        { status: 503 }
      );
    }
    console.error("contact form send failed:", message);
    return NextResponse.json(
      { error: "Could not send your message. Try email directly." },
      { status: 502 }
    );
  }
}
