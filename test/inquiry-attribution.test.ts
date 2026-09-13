import { describe, expect, it } from "vitest";
import {
  formatInquiryAttributionLines,
  parseInquiryAttribution,
  readInquiryAttributionFromSearch,
} from "@/lib/inquiry-attribution";

describe("inquiry attribution", () => {
  it("keeps only allowlisted keys and strips unsafe values", () => {
    expect(
      parseInquiryAttribution({
        utm_source: "  linkedin  ",
        utm_medium: "cpc",
        ref: "deck",
        utm_campaign: "line\nbreak",
        other: "nope",
      }),
    ).toEqual({ utm_source: "linkedin", utm_medium: "cpc", ref: "deck" });
  });

  it("reads from a query string", () => {
    expect(readInquiryAttributionFromSearch("?utm_source=x&ref=y&offer=video")).toEqual({
      utm_source: "x",
      ref: "y",
    });
  });

  it("formats email lines in a stable key order", () => {
    expect(
      formatInquiryAttributionLines({ ref: "deck", utm_source: "newsletter", utm_term: "fit" }),
    ).toEqual(["utm_source: newsletter", "utm_term: fit", "ref: deck"]);
  });
});
