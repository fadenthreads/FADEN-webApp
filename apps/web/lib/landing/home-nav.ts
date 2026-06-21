/** Query flag used when navigating home via logo / All — skips the intro landing. */
export const HOME_SKIP_INTRO_QUERY = "home";

export function homeHref(options?: { hash?: string; category?: string }): string {
  const params = new URLSearchParams({ [HOME_SKIP_INTRO_QUERY]: "1" });
  if (options?.category) {
    params.set("category", options.category);
  }
  const hash = options?.hash ? `#${options.hash.replace(/^#/, "")}` : "";
  return `/?${params.toString()}${hash}`;
}

export function shouldSkipHomeIntro(searchParams: {
  home?: string | string[] | null | undefined;
}): boolean {
  const value = searchParams.home;
  if (Array.isArray(value)) return value.includes("1");
  return value === "1";
}
