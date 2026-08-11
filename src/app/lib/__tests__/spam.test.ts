import { describe, expect, it } from "vitest";
import { isSpamToken, ownerHintFromEnsName } from "../spam";

describe("isSpamToken", () => {
  it("allows a normal token with no name/symbol signals", () => {
    expect(isSpamToken("Wrapped Ether", "WETH", null)).toBe(false);
  });

  it("flags URL-baiting names", () => {
    expect(isSpamToken("Visit uniswap-reward.xyz", "CLAIM", null)).toBe(true);
  });

  it("flags $-prefixed lure tickers", () => {
    expect(isSpamToken("Free Money", "$FREE", null)).toBe(true);
  });

  it("flags claim/airdrop/reward/bonus keywords", () => {
    expect(isSpamToken("Uniswap Airdrop", "UNI-A", null)).toBe(true);
  });

  it("flags homoglyph impersonation of a protected symbol", () => {
    // "ETH" spelled with a combining diacritic on the E
    expect(isSpamToken(null, "ÈTH", null)).toBe(true);
  });

  it("does not flag a real protected symbol spelled normally", () => {
    expect(isSpamToken("Ether", "ETH", null)).toBe(false);
  });

  it("flags tokens impersonating the wallet owner's ENS name", () => {
    expect(isSpamToken("VITALIK", "VTLK", "vitalik")).toBe(true);
  });

  it("ignores short owner hints to avoid false positives", () => {
    expect(isSpamToken("Random Token", "RND", "vb")).toBe(false);
  });

  it("returns false for empty name and symbol", () => {
    expect(isSpamToken(null, null, "vitalik")).toBe(false);
  });
});

describe("ownerHintFromEnsName", () => {
  it("extracts the label from an ENS name", () => {
    expect(ownerHintFromEnsName("vitalik.eth")).toBe("vitalik");
  });

  it("returns null when there is no ENS name", () => {
    expect(ownerHintFromEnsName(null)).toBeNull();
  });
});
