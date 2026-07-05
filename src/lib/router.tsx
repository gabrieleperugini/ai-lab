import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

/**
 * Tiny hash-based router, safe for GitHub Pages (no server rewrites needed).
 * Routes look like:  #/    #/day1    #/day1/next-token-arena
 *                    #/day1/next-token-arena/context   (deep link into a module
 *                    section, e.g. an Arena category; used by the slide QR codes)
 * Class/teacher settings travel in the normal query string (?class=A&teacher=1)
 * so they survive hash navigation and page refreshes.
 */

export type Route =
  | { page: "home" }
  | { page: "day"; dayId: string }
  | { page: "module"; dayId: string; moduleId: string; extra?: string };

function parseHash(hash: string): Route {
  const clean = hash.replace(/^#\/?/, "").replace(/\/+$/, "");
  if (!clean) return { page: "home" };
  const parts = clean.split("/").filter(Boolean);
  if (parts.length === 1) return { page: "day", dayId: parts[0] };
  return { page: "module", dayId: parts[0], moduleId: parts[1], extra: parts[2] };
}

const RouteContext = createContext<Route>({ page: "home" });

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return <RouteContext.Provider value={route}>{children}</RouteContext.Provider>;
}

export function useRoute(): Route {
  return useContext(RouteContext);
}

export function hrefTo(route: Route): string {
  switch (route.page) {
    case "home":
      return "#/";
    case "day":
      return `#/${route.dayId}`;
    case "module":
      return `#/${route.dayId}/${route.moduleId}`;
  }
}
