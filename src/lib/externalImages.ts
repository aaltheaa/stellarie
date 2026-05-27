// src/lib/externalImages.ts
// Derives the IAU constellation chart image URL from constellationdirectory.org
// Pattern: id with hyphens → underscores, one exception for serpens

export function getExternalImageUrl(id: string): string {
  const slug = id === 'serpens' ? 'serpens_caput' : id.replace(/-/g, '_')
  return `http://www.constellationdirectory.org/images/${slug}.jpg`
}
