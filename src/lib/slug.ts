/**
 * Generate a URL-safe slug from a title string.
 * Appends a short timestamp suffix to ensure uniqueness.
 */
export function generateSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const timestamp = Date.now().toString(36);
  return `${baseSlug || 'item'}-${timestamp}`;
}
