// --- Rich Text Component ---
//
// Generates SAIL code for an Appian Rich Text Display Field (a!richTextDisplayField).
// Runs when the selected node is a TEXT node.
//
// Extracts styled text segments from the Figma node and maps each one to an
// a!richTextItem() with the appropriate Appian properties:
//   - Text size  → "SMALL", "STANDARD", "MEDIUM", "MEDIUM_PLUS", "LARGE", "EXTRA_LARGE"
//   - Bold       → style: "STRONG"
//   - Italic     → style: "EMPHASIS"
//   - Underline  → style: "UNDERLINE"
//   - Strikethrough → style: "STRIKETHROUGH"
//   - Text color → color: "#RRGGBB"

import { richTextDisplayField, richTextItem } from '../templates'
import { rgbToHex } from '../utils'

// --- Font Size Mapping ---
// Maps Figma pixel sizes to Appian rich text size constants.
// Returns undefined for STANDARD (the default) so we can omit the prop.
function mapFontSizeToAppian(px: number): string | undefined {
  if (px <= 12) return 'SMALL'
  if (px <= 14) return undefined   // STANDARD — omit to keep output clean
  if (px <= 16) return 'MEDIUM'
  if (px <= 18) return 'MEDIUM_PLUS'
  if (px <= 22) return 'LARGE'
  return 'EXTRA_LARGE'
}

/**
 * Generate a!richTextDisplayField SAIL code from a Figma TextNode.
 * Uses getStyledTextSegments to respect per-character formatting.
 * Falls back to node.characters if the API is unavailable.
 */
export function generateRichTextSAIL(
  node: TextNode,
  marginAbove?: string,
  marginBelow?: string
): string {
  let items: string[]

  try {
    // Retrieve segments split by visual styling differences
    const segments = node.getStyledTextSegments(
      ['fontSize', 'fontName', 'fontWeight', 'textDecoration', 'fills']
    )

    items = segments.map(seg => {
      const text = seg.characters

      // --- Size ---
      const size = mapFontSizeToAppian(seg.fontSize)

      // --- Styles (bold, italic, underline, strikethrough) ---
      const styles: string[] = []
      // Bold: fontWeight ≥ 600 covers Semi Bold, Bold, Extra Bold, etc.
      if (seg.fontWeight >= 600) {
        styles.push('STRONG')
      }
      // Italic: check the fontName style string (e.g. "Italic", "Bold Italic")
      if (seg.fontName.style.toLowerCase().includes('italic')) {
        styles.push('EMPHASIS')
      }
      // Underline / Strikethrough from textDecoration
      if (seg.textDecoration === 'UNDERLINE') {
        styles.push('UNDERLINE')
      }
      if (seg.textDecoration === 'STRIKETHROUGH') {
        styles.push('STRIKETHROUGH')
      }

      // --- Color ---
      let color: string | undefined
      if (seg.fills && seg.fills.length > 0) {
        const fill = seg.fills[0]
        if (fill.type === 'SOLID') {
          const hex = rgbToHex(fill.color)
          // Only include color if it's not default black
          if (hex !== '#000000') {
            color = hex
          }
        }
      }

      return richTextItem({
        text,
        size,
        style: styles.length > 0 ? styles : undefined,
        color,
      })
    })
  } catch (_e) {
    // Fallback: use plain text when getStyledTextSegments is unavailable
    const text = node.characters || ''
    items = [richTextItem({ text })]
  }

  return richTextDisplayField({ items, marginAbove, marginBelow })
}
