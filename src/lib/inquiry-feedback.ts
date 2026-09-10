export const inquiryFeedback = {
  invalid: "Your inquiry was not sent. Check the fields and try again, or email joachim@noobwork.no.",
  large: "Your inquiry was not sent. Please shorten it and try again, or email joachim@noobwork.no.",
  limited: "Too many requests. Please try again later or email joachim@noobwork.no directly.",
  unavailable: "The contact form is unavailable. Please email joachim@noobwork.no directly.",
  failed: "Could not send your inquiry. Please try again or email joachim@noobwork.no directly.",
} as const;

export type InquiryFeedbackCode = keyof typeof inquiryFeedback;

export function getInquiryFeedback(code: unknown): string | undefined {
  return typeof code === "string" && Object.hasOwn(inquiryFeedback, code)
    ? inquiryFeedback[code as InquiryFeedbackCode]
    : undefined;
}
