// Simple Arabic → Latin transliteration for auto-generating English usernames.
// Not perfect linguistically; good enough for username suggestion.

const MAP: Record<string, string> = {
  ا: "a", أ: "a", إ: "i", آ: "aa", ٱ: "a",
  ب: "b", ت: "t", ث: "th",
  ج: "j", ح: "h", خ: "kh",
  د: "d", ذ: "th",
  ر: "r", ز: "z",
  س: "s", ش: "sh",
  ص: "s", ض: "d",
  ط: "t", ظ: "z",
  ع: "a", غ: "gh",
  ف: "f", ق: "q",
  ك: "k", ل: "l", م: "m", ن: "n",
  ه: "h", ة: "h", و: "w", ؤ: "o",
  ي: "y", ى: "a", ئ: "y", ء: "",
  پ: "p", چ: "ch", ژ: "zh", گ: "g",
  // diacritics removed
  "\u064B": "", "\u064C": "", "\u064D": "", "\u064E": "", "\u064F": "",
  "\u0650": "", "\u0651": "", "\u0652": "", "\u0653": "", "\u0670": "",
};

export function transliterate(text: string): string {
  return text
    .split("")
    .map((c) => (MAP[c] !== undefined ? MAP[c] : /[a-zA-Z0-9]/.test(c) ? c : " "))
    .join("");
}

const HONORIFICS = new Set([
  "د", "د.", "م", "م.", "أ", "أ.", "ا", "ا.",
  "السيد", "السيدة", "الأستاذ", "الأستاذة",
  "المهندس", "المهندسة", "الدكتور", "الدكتورة",
]);

/** Generate username like firstname.lastname from an Arabic full name. */
export function generateUsername(fullName: string, takenSet: Set<string> = new Set()): string {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter((p) => !HONORIFICS.has(p.replace(/\.$/, "")) && !HONORIFICS.has(p));

  if (parts.length === 0) return "";

  const first = transliterate(parts[0]).toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
  const lastSrc = parts[parts.length - 1];
  const last = transliterate(lastSrc).toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");

  let base = last && last !== first ? `${first}.${last}` : first;
  if (!base) base = "user";

  let candidate = base;
  let i = 1;
  while (takenSet.has(candidate)) {
    candidate = `${base}${i++}`;
  }
  return candidate;
}
