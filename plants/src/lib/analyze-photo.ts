import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";
import type { PhotoAnalysisFinding, PlantWithMeta } from "@/types";

const analysisSchema = z.object({
  overallHealth: z.enum(["healthy", "stressed", "concerning"]),
  confidence: z.number().min(0).max(1),
  summary: z.string(),
  wateringAssessment: z.enum(["ok", "likely_under", "likely_over"]),
  lightAssessment: z.string(),
  pestsDetected: z.boolean(),
  followUpDays: z.number().int().min(1).max(60),
  findings: z.array(
    z.object({
      type: z.string(),
      severity: z.enum(["low", "moderate", "high"]),
      description: z.string(),
      action: z.string(),
    }),
  ),
});

export type AnalysisResult = z.infer<typeof analysisSchema>;

export async function analyzePlantPhoto(
  imageBuffer: Buffer,
  mimeType: string,
  plant: PlantWithMeta,
): Promise<AnalysisResult | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  const base64 = imageBuffer.toString("base64");

  const context = [
    `Plant nickname: ${plant.nickname}`,
    `Species: ${plant.species.typeName}`,
    `Room: ${plant.room.name}`,
    `Last watered: ${plant.lastWateredAt.slice(0, 10)}`,
    `Water status: ${plant.waterStatus}`,
    `Care tips: ${plant.species.careTips}`,
    plant.latestAnalysis
      ? `Previous check (${plant.latestAnalysis.createdAt.slice(0, 10)}): ${plant.latestAnalysis.summary}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const { object } = await generateObject({
    model: anthropic("claude-sonnet-4-20250514"),
    schema: analysisSchema,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `You are a houseplant care assistant. Analyze this photo for health, watering needs, light adequacy, and pests. Be conservative — if unsure, say so. Do not diagnose with medical certainty.

Context:
${context}

Return structured JSON only. Findings should be practical for an apartment plant parent.`,
          },
          {
            type: "image",
            image: `data:${mimeType};base64,${base64}`,
          },
        ],
      },
    ],
  });

  return object;
}

export function stubAnalysis(): AnalysisResult {
  return {
    overallHealth: "healthy",
    confidence: 0.5,
    summary:
      "Photo saved. Add ANTHROPIC_API_KEY to enable AI condition analysis.",
    wateringAssessment: "ok",
    lightAssessment: "Unable to assess without vision API.",
    pestsDetected: false,
    followUpDays: 14,
    findings: [] as PhotoAnalysisFinding[],
  };
}
