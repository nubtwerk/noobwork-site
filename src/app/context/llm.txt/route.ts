import { buildContextMarkdown } from "@/lib/load-context";

export async function GET() {
  const markdown = await buildContextMarkdown();

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
