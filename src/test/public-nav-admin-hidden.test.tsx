import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterContextProvider } from "@tanstack/react-router";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { LanguageProvider } from "@/components/site/language";
import { SiteShell } from "@/components/site/shell";

// The shared header and footer wrap every public page, so they are the place an
// administrator sign-in link would leak into public navigation.
async function renderShell() {
  const queryClient = new QueryClient();
  const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: false,
  });
  await router.load();
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterContextProvider router={router}>
        <LanguageProvider>
          <SiteShell>
            <p>content</p>
          </SiteShell>
        </LanguageProvider>
      </RouterContextProvider>
    </QueryClientProvider>,
  );
}

describe("Public navigation hides the admin area", () => {
  it("renders no link to an admin path in the header or footer", async () => {
    const { container } = await renderShell();

    const hrefs = [...container.querySelectorAll<HTMLAnchorElement>("a[href]")].map(
      (a) => a.getAttribute("href") ?? "",
    );

    expect(hrefs.length).toBeGreaterThan(0);
    expect(hrefs.filter((href) => href.toLowerCase().includes("admin"))).toEqual([]);
  });

  it("offers no sign-in wording to visitors", async () => {
    const { container } = await renderShell();

    const text = container.textContent ?? "";

    expect(text).not.toMatch(/sign in/i);
    expect(text).not.toMatch(/log ?in/i);
  });
});
