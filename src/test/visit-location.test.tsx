import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { VisitSection } from "@/components/site/sections";
import {
  dictionaries,
  mapsDirectionsUrl,
  mapsSearchUrl,
  mosqueAddress,
  mosqueAddressHead,
  mosqueAddressTail,
} from "@/lib/translations";

// The location section is shared by the homepage and the Visit Us page, so the
// rendered section is the contract for both.
describe("Verified location and Google Maps links", () => {
  const { container } = render(<VisitSection full />);

  it("shows the exact verified address", () => {
    expect(container.textContent).toContain(mosqueAddress);
    expect(mosqueAddress).toBe("2557-1 Tarodai, Kita-ku, Niigata-shi, Niigata 950-3101, Japan");
    expect(`${mosqueAddressHead} ${mosqueAddressTail}`).toBe(mosqueAddress);
  });

  it("links out with the exact Google Maps URLs in a new tab", () => {
    const search = screen.getByRole("link", { name: /View on Google Maps/i });
    const directions = screen.getByRole("link", { name: /Get Directions/i });

    expect(search.getAttribute("href")).toBe(
      "https://www.google.com/maps/search/?api=1&query=Islamic%20Center%20of%20Niigata%2C%202557-1%20Tarodai%2C%20Niigata%2C%20Japan",
    );
    expect(directions.getAttribute("href")).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=Islamic%20Center%20of%20Niigata%2C%202557-1%20Tarodai%2C%20Niigata%2C%20Japan",
    );

    for (const link of [search, directions]) {
      expect(link.getAttribute("href")).not.toContain("\\");
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    }
  });

  it("labels both buttons in every supported language", () => {
    expect(dictionaries.en.mapsView).toBe("View on Google Maps");
    expect(dictionaries.en.mapsDirections).toBe("Get Directions");
    expect(dictionaries.ja.mapsView).toBe("Googleマップで見る");
    expect(dictionaries.ja.mapsDirections).toBe("ルートを検索");
    expect(dictionaries.ur.mapsView).toBe("گوگل میپس پر دیکھیں");
    expect(dictionaries.ur.mapsDirections).toBe("راستہ معلوم کریں");
    expect(mapsSearchUrl).toContain("maps/search");
    expect(mapsDirectionsUrl).toContain("maps/dir");
  });
});
