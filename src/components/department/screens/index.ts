import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { DepartmentId } from "@/content/departments";
import type { ScreenProps } from "../contract";
import { ScreenFallback } from "../ScreenFallback";

/**
 * The screen registry: one lazily loaded console per department (regions A to D).
 * Each screen is its own chunk, so a department page only downloads the console it shows.
 * They are still server-rendered, which keeps every figure on the console in the HTML.
 */

type ScreenComponent = ComponentType<ScreenProps>;
type ScreenModule = { default?: ScreenComponent } & Record<string, unknown>;

/** A screen may be the default export or a named one matching its file: accept either. */
const pick =
  (name: string) =>
  (mod: ScreenModule): ScreenComponent => {
    const screen = mod.default ?? (mod[name] as ScreenComponent | undefined);
    if (!screen) throw new Error(`${name} does not export a screen component`);
    return screen;
  };

// next/dynamic needs each import() written out literally, with a literal options object.
export const SCREENS: Record<DepartmentId, ScreenComponent> = {
  marketing: dynamic(() => import("./MarketingScreen").then(pick("MarketingScreen")), { loading: ScreenFallback }),
  sales: dynamic(() => import("./SalesScreen").then(pick("SalesScreen")), { loading: ScreenFallback }),
  service: dynamic(() => import("./ServiceScreen").then(pick("ServiceScreen")), { loading: ScreenFallback }),
  finance: dynamic(() => import("./FinanceScreen").then(pick("FinanceScreen")), { loading: ScreenFallback }),
  operations: dynamic(() => import("./OperationsScreen").then(pick("OperationsScreen")), { loading: ScreenFallback }),
  knowledge: dynamic(() => import("./KnowledgeScreen").then(pick("KnowledgeScreen")), { loading: ScreenFallback }),
  administration: dynamic(() => import("./AdministrationScreen").then(pick("AdministrationScreen")), { loading: ScreenFallback }),
};
