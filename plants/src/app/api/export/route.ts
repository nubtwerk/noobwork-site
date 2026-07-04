import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { exportSnapshot } from "@/lib/plants-service";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await exportSnapshot();
  const date = new Date().toISOString().slice(0, 10);

  return NextResponse.json(snapshot, {
    headers: {
      "Content-Disposition": `attachment; filename="plants-export-${date}.json"`,
    },
  });
}
