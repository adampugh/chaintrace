const URL_PATTERN = /(\.com|\.xyz|\.gg|www\.|http)/i;
const KEYWORD_PATTERN = /(claim|airdrop|reward|bonus)/i;
// Unicode "Combining Diacritical Marks" block (U+0300-U+036F).
const COMBINING_MARKS_PATTERN = /[̀-ͯ]/g;

// Major asset symbols worth protecting against homoglyph impersonation
// (e.g. a fake token using "Ė" U+0116 / "Ḩ" U+1E28 in place of "E"/"H" to
// spoof "ETH" in a transactions list). Only symbols that *look* like these
// but aren't spelled with plain ASCII trigger the check — the real ETH/USDC
// entries always pass, since their raw spelling already matches cleanly.
const PROTECTED_SYMBOLS = new Set([
  "ETH",
  "WETH",
  "BTC",
  "WBTC",
  "USDC",
  "USDT",
  "DAI",
]);

function normalize(str: string): string {
  return stripDiacritics(str)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

// Decomposes precomposed accented/diacritic Latin characters (NFKD) and
// drops the combining marks, e.g. "Ė" -> "E" + combining-dot -> "E". This
// catches the diacritic-based homoglyphs actually seen in the wild; it
// won't catch cross-script lookalikes (Cyrillic "а" vs Latin "a"), which
// would need a separate confusables table.
function stripDiacritics(str: string): string {
  return str.normalize("NFKD").replace(COMBINING_MARKS_PATTERN, "");
}

function isHomoglyphImpersonation(text: string | null): boolean {
  const trimmed = text?.trim();
  if (!trimmed) return false;
  const cleaned = stripDiacritics(trimmed).toUpperCase();
  return cleaned !== trimmed.toUpperCase() && PROTECTED_SYMBOLS.has(cleaned);
}

/**
 * Best-effort spam/impersonation filter for a token's name+symbol. Catches:
 * - URL-baiting and claim/airdrop/reward/bonus lures, by pattern
 * - tokens named after the wallet's own public identity (airdropping
 *   "VITALIK" to vitalik.eth so it looks legitimate sitting in his own
 *   wallet) — `ownerHint` should be derived from that wallet's *own*
 *   resolved ENS/display name (see `ownerHintFromEnsName`), not a fixed
 *   string, since the impersonation target is whoever owns the wallet
 *   being scammed
 * - homoglyph impersonation of major asset tickers (e.g. a fake "ETH"
 *   spelled with lookalike accented characters)
 *
 * This is heuristic, not exhaustive — matches on substring/pattern, not a
 * full fuzzy/edit-distance comparison, so unusual spellings can still slip
 * through. Spam patterns keep evolving.
 */
export function isSpamToken(
  name: string | null,
  symbol: string | null,
  ownerHint: string | null,
): boolean {
  const text = `${name ?? ""} ${symbol ?? ""}`;
  if (!text.trim()) return false;

  if (URL_PATTERN.test(text)) return true;
  if (text.includes("$")) return true;
  if (KEYWORD_PATTERN.test(text)) return true;
  if (isHomoglyphImpersonation(name) || isHomoglyphImpersonation(symbol)) {
    return true;
  }

  if (ownerHint) {
    const normalizedHint = normalize(ownerHint);
    // Guard short hints (e.g. a 2-letter ENS name) — would otherwise match
    // an unreasonable number of unrelated tokens by pure substring luck.
    if (normalizedHint.length >= 3 && normalize(text).includes(normalizedHint)) {
      return true;
    }
  }

  return false;
}

/** "vitalik.eth" -> "vitalik". Returns null if there's no resolved name to key off. */
export function ownerHintFromEnsName(ensName: string | null): string | null {
  if (!ensName) return null;
  return ensName.split(".")[0] || null;
}
