import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTilt } from "@/hooks/useTilt";
import { useMagnetic } from "@/hooks/useMagnetic";

function Layout({ page, enabled = true }: { page: string; enabled?: boolean }) {
  useTilt(enabled);
  useMagnetic(enabled);
  return <div key={page}><div data-tilt>{page} card</div><button data-magnetic>{page} button</button></div>;
}

describe("hover effects across navigation", () => {
  it("binds to replacement page content and restores transforms when disabled", () => {
    const { rerender } = render(<Layout page="first" />);
    const first = screen.getByText("first button");
    fireEvent.mouseMove(first, { clientX: 40, clientY: 30 });
    expect(first.style.transform).toContain("translate");
    rerender(<Layout page="second" />);
    const second = screen.getByText("second button");
    fireEvent.mouseMove(second, { clientX: 60, clientY: 50 });
    expect(second.style.transform).toContain("translate");
    const card = screen.getByText("second card");
    card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100 } as DOMRect);
    fireEvent.mouseMove(card, { clientX: 60, clientY: 50 });
    expect(card.style.transform).toContain("perspective");
    rerender(<Layout page="second" enabled={false} />);
    expect(card.style.transform).toBe("");
    expect(second.style.transform).toBe("");
  });
});
