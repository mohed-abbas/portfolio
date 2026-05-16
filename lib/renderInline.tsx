import { Fragment, type ReactNode } from "react";

// Renders a string that may contain markdown-style **bold** spans as a
// React fragment, wrapping bold runs in <strong>. Used by case-study
// section components to surface emphasis encoded in case-studies.json.
//
// Encoding contract: text outside ** is rendered as-is; text between an
// opening and closing ** pair is wrapped in <strong>. A trailing ** with
// no closing match is treated as literal text.
export function renderInline(input: string): ReactNode[] {
  const parts = input.split("**");
  const nodes: ReactNode[] = [];
  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    if (part === "") continue;
    const isBold = i % 2 === 1 && i < parts.length - 1;
    nodes.push(
      isBold ? (
        <strong key={i}>{part}</strong>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      )
    );
  }
  return nodes;
}
