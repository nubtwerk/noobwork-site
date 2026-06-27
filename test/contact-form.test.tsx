import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
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
    expect(screen.getByRole("button", { name: "Send inquiry" })).toBeInTheDocument();
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
    fireEvent.click(screen.getByRole("button", { name: "Send inquiry" }));

    await waitFor(() => {
      expect(screen.getByText("Message sent.")).toBeInTheDocument();
    });
    expect(fetch).toHaveBeenCalledWith(
      "/api/contact",
      expect.objectContaining({ method: "POST" })
    );
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
    fireEvent.click(screen.getByRole("button", { name: "Send inquiry" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Please enter a valid email.");
    });
  });
});
