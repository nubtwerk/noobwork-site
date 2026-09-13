import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import ContactForm from "@/components/ui/ContactForm";
import { trackPartnership } from "@/lib/partnership-analytics";

vi.mock("@/lib/partnership-analytics", () => ({
  trackPartnership: vi.fn(),
}));

describe("ContactForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.mocked(trackPartnership).mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders inquiry fields and submit button", () => {
    render(<ContactForm />);
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText(/Company \/ Brand/)).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send partnership inquiry" })).toBeInTheDocument();
  });

  it("shows success state after a successful submit", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );

    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Alex Brand" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "alex@brand.no" } });
    fireEvent.change(screen.getByLabelText("Message"), {
      target: {
        value: "We would love to explore a Q3 campaign across YouTube and IG.",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send partnership inquiry" }));

    await waitFor(() => {
      expect(screen.getByText("Message sent.")).toBeInTheDocument();
    });
    expect(screen.getByText(/usually within a few business days/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "joachim@noobwork.no" })).toHaveAttribute(
      "href",
      "mailto:joachim@noobwork.no"
    );
    expect(fetch).toHaveBeenCalledWith(
      "/api/contact",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("keeps the draft when the selected offer changes", () => {
    const { rerender } = render(<ContactForm initialOffer="video" />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Alex Brand" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "A campaign brief worth keeping." } });
    rerender(<ContactForm initialOffer="series" />);
    expect(screen.getByLabelText("Name")).toHaveValue("Alex Brand");
    expect(screen.getByLabelText("Message")).toHaveValue("A campaign brief worth keeping.");
    expect(screen.getByLabelText("Partnership format")).toHaveValue("series");
  });

  it("provides a real link to reopen the form after native success", () => {
    render(<ContactForm feedback="sent" />);
    expect(screen.getByRole("link", { name: "Send another message" })).toHaveAttribute("href", "/media-kit#inquiry");
  });

  it("keeps a slow request single-flight and lets the visitor retry a network failure", async () => {
    let rejectRequest!: (error: Error) => void;
    vi.mocked(fetch).mockImplementation(() => new Promise<Response>((_, reject) => { rejectRequest = reject; }));
    render(<ContactForm initialOffer="series" />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Alex Example" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "alex@example.com" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "A campaign brief worth keeping after an outage." } });
    const button = screen.getByRole("button", { name: "Send partnership inquiry" });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(fetch).toHaveBeenCalledOnce();
    expect(button).toBeDisabled();
    await act(async () => { rejectRequest(new Error("offline")); });
    expect(screen.getByRole("alert")).toHaveTextContent("Network error");
    expect(screen.getByLabelText("Message")).toHaveValue("A campaign brief worth keeping after an outage.");
    expect(button).toBeEnabled();
    vi.mocked(fetch).mockResolvedValue(new Response('{"ok":true}'));
    fireEvent.click(button);
    await waitFor(() => expect(screen.getByText("Message sent.")).toBeInTheDocument());
  });

  it("does not claim success on a malformed successful HTTP response", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 200 }));
    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Alex Example" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "alex@example.com" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "A campaign brief worth keeping after an outage." } });
    fireEvent.click(screen.getByRole("button", { name: "Send partnership inquiry" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Could not send"));
    expect(screen.queryByText("Message sent.")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toHaveValue("A campaign brief worth keeping after an outage.");
  });

  it("shows an error when the API rejects the submission", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "Please enter a valid email." }), {
        status: 400,
      })
    );

    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Alex Brand" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "alex@brand.no" } });
    fireEvent.change(screen.getByLabelText("Message"), {
      target: {
        value: "We would love to explore a Q3 campaign across YouTube and IG.",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send partnership inquiry" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Please enter a valid email.");
    });
    expect(trackPartnership).toHaveBeenCalledWith("inquiry_failed", { offer: "" });
  });

  it("tracks rate limits separately and includes UTM context in the request body only", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "Too many requests." }), { status: 429 }),
    );

    render(
      <ContactForm
        initialOffer="video"
        initialAttribution={{ utm_source: "newsletter", ref: "deck" }}
      />,
    );
    expect(document.querySelector('input[name="utm_source"]')).toHaveValue("newsletter");
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Alex Brand" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "alex@brand.no" } });
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "We would love to explore a Q3 campaign across YouTube and IG." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send partnership inquiry" }));

    await waitFor(() => {
      expect(trackPartnership).toHaveBeenCalledWith("inquiry_rate_limited", { offer: "video" });
    });
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
    expect(body.utm_source).toBe("newsletter");
    expect(body.ref).toBe("deck");
  });
});
