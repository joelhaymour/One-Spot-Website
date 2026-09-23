import { BEFORE_AFTER } from "./copy";

/** The eight tools of the drawing, as a type: a scenario can only name a tile that exists. */
export type ToolName = (typeof BEFORE_AFTER.tools)[number];

export const TOOL_NAMES = BEFORE_AFTER.tools as readonly ToolName[];
