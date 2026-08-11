import { describe, expect, it } from "vitest";
import { currencyFormatter } from "../format";

describe("currencyFormatter", () => {
  it("formats a number as USD currency", () => {
    expect(currencyFormatter.format(1234.5)).toBe("$1,234.50");
  });

  it("formats zero", () => {
    expect(currencyFormatter.format(0)).toBe("$0.00");
  });
});
