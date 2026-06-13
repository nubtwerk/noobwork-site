import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ContentReel from "@/components/sections/ContentReel";
import { featuredVideo, recentVideos } from "@/data/videos";

describe("ContentReel", () => {
  it("renders the featured video as a facade, not an iframe", () => {
    const { container } = render(<ContentReel />);
    expect(
      screen.getByLabelText(`Play video: ${featuredVideo.title}`)
    ).toBeInTheDocument();
    expect(container.querySelector("iframe")).not.toBeInTheDocument();
    expect(screen.getByText(featuredVideo.title)).toBeInTheDocument();
  });

  it("swaps the facade for the embed iframe on click", () => {
    const { container } = render(<ContentReel />);
    fireEvent.click(screen.getByLabelText(`Play video: ${featuredVideo.title}`));
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      "src",
      `https://www.youtube-nocookie.com/embed/${featuredVideo.id}?autoplay=1`
    );
    expect(
      screen.queryByLabelText(`Play video: ${featuredVideo.title}`)
    ).not.toBeInTheDocument();
  });

  it("renders every recent video as an external watch link", () => {
    render(<ContentReel />);
    recentVideos.forEach((video) => {
      const link = screen.getByText(video.title).closest("a");
      expect(link).toHaveAttribute(
        "href",
        `https://www.youtube.com/watch?v=${video.id}`
      );
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  it("renders the subscribe link to the channel", () => {
    render(<ContentReel />);
    const subscribe = screen.getByText("Subscribe on YouTube").closest("a");
    expect(subscribe).toHaveAttribute(
      "href",
      "https://www.youtube.com/@Noobworkify"
    );
    expect(subscribe).toHaveAttribute("target", "_blank");
  });
});
