export const FABRIC_KIND_SUGGESTIONS = [
  "Silk",
  "Raw silk",
  "Tussar silk",
  "Banarasi silk",
  "Kanjeevaram silk",
  "Cotton",
  "Khadi",
  "Linen",
  "Georgette",
  "Chiffon",
  "Crepe",
  "Satin",
  "Velvet",
  "Organza",
  "Net",
  "Brocade",
  "Zari work fabric",
  "Jacquard",
  "Tissue",
  "Mull",
] as const;

export const FABRIC_COLOR_SUGGESTIONS = [
  "Emerald green",
  "Royal blue",
  "Navy blue",
  "Maroon",
  "Burgundy",
  "Wine red",
  "Red",
  "Gold",
  "Antique gold",
  "Champagne",
  "Ivory",
  "Off white",
  "Cream",
  "Beige",
  "Peach",
  "Blush pink",
  "Rose pink",
  "Magenta",
  "Purple",
  "Lavender",
  "Lilac",
  "Turquoise",
  "Teal",
  "Mint green",
  "Olive green",
  "Mustard yellow",
  "Rust",
  "Coral",
  "Orange",
  "Black",
  "White",
  "Silver",
  "Grey",
  "Pastel blue",
  "Pastel pink",
] as const;

export function filterFabricSuggestions(
  suggestions: readonly string[],
  query: string,
  limit = 8,
): string[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...suggestions].slice(0, limit);

  return suggestions
    .filter((item) => {
      const lower = item.toLowerCase();
      return lower.includes(needle) || needle.includes(lower);
    })
    .slice(0, limit);
}

export function getActiveToken(value: string, cursorIndex: number | null = null): string {
  const index = cursorIndex ?? value.length;
  const beforeCursor = value.slice(0, index);
  const lastComma = beforeCursor.lastIndexOf(",");
  const token = beforeCursor.slice(lastComma + 1);
  return token.trimStart();
}

export function applySuggestionToValue(
  value: string,
  cursorIndex: number | null,
  suggestion: string,
  appendComma: boolean,
): string {
  const index = cursorIndex ?? value.length;
  const beforeCursor = value.slice(0, index);
  const afterCursor = value.slice(index);
  const lastComma = beforeCursor.lastIndexOf(",");
  const prefix = lastComma === -1 ? "" : beforeCursor.slice(0, lastComma + 1);
  const spacer = prefix && !prefix.endsWith(" ") ? " " : "";
  const nextValue = `${prefix}${spacer}${suggestion}${appendComma ? ", " : ""}${afterCursor.replace(/^[\s,]+/, "")}`;
  return nextValue.replace(/\s+,/g, ",").replace(/,\s*,/g, ", ");
}
