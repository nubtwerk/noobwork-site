import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import ContactForm from "@/components/ui/ContactForm";

describe("ContactForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
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
  });
});
