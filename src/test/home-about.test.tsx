import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomePage } from "@/components/site/home";
import { dictionaries } from "@/lib/translations";

// The homepage must lead with the prayer schedule and then introduce the center,
// so the About section (with the president's photograph) sits directly below it.
describe("Homepage About section placement", () => {
  it("places the About section directly below the prayer-times section", () => {
    const { container } = render(<HomePage />);

    const prayer = container.querySelector(".prayer-section");
    const about = container.querySelector(".about-section");
    const news = container.querySelector(".news-section");

    expect(prayer).not.toBeNull();
    expect(about).not.toBeNull();
    expect(news).not.toBeNull();

    // About must follow prayer times immediately, and both must precede the
    // announcements/events columns.
    expect(about?.previousElementSibling).toBe(prayer);
    expect(
      about!.compareDocumentPosition(news!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("shows the president's photograph inside that About section", () => {
    const { container } = render(<HomePage />);

    const about = container.querySelector(".about-section");
    const photo = about?.querySelector<HTMLImageElement>(".president-card img");

    expect(photo).not.toBeNull();
    expect(photo?.getAttribute("src")).toBeTruthy();
    expect(photo?.getAttribute("alt")).toBe(dictionaries.en.presidentPhoto);
    expect(about?.querySelector("a")?.getAttribute("href")).toContain("/about");
  });
});
