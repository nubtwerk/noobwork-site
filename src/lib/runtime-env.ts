/** Vercel previews use production builds but remain an explicit review environment. */
export function isProductionRuntime(): boolean {
  const target = process.env.VERCEL_ENV;
  return target === "production" ||
    (process.env.NODE_ENV === "production" && target !== "preview" && target !== "development");
}
