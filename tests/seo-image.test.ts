import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("generated social images", () => {
  it("do not require remote emoji assets during the production build", () => {
    const source = readFileSync(resolve(process.cwd(), "src/app/opengraph-image.tsx"), "utf8");

    expect(source).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
