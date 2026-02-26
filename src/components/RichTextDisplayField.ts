// --- Rich Text / Heading Component ---
//
// Generates SAIL code for Appian text components:
//   • a!headingField()        — when text has a "Heading" style applied uniformly
//   • a!richTextDisplayField() — for body text or mixed-style text
//
// Text style detection:
//   1. Check if a text style is applied (e.g., "Heading/Large" or "Body/Medium Text")
//   2. If style contains "Heading" and all text uses the same style → headingField
//   3. If style matches "Body/[Size] Text" → use that size for richTextItem
//   4. Otherwise, fall back to pixel-based size detection
//
// Style properties:
//   - Text size  → "SMALL", "STANDARD", "MEDIUM", "MEDIUM_PLUS", "LARGE", "EXTRA_LARGE"
//   - Bold       → style: "STRONG" (richText) or decoration: "STRONG" (heading)
//   - Italic     → style: "EMPHASIS"
//   - Underline  → style: "UNDERLINE" or decoration: "UNDERLINE"
//   - Strikethrough → style: "STRIKETHROUGH"
//   - Text color → color: "#RRGGBB"

import { richTextDisplayField, richTextItem, headingField } from '../templates'
import { rgbToHex } from '../utils'

// --- Helper: Parse text style name for size ---
// Recognizes patterns like "Heading/Large" or "Body/Medium Text"
// and converts Title Case sizes to UPPERCASE for Appian.
function parseSizeFromStyleName(styleName: string): string | undefined {
  // Pattern: "Heading/[Size]" or "Body/[Size] Text"
  const headingMatch = styleName.match(/Heading\/([A-Za-z]+)/)
  const bodyMatch = styleName.match(/Body\/([A-Za-z]+)\s+Text/)
  
  const sizeStr = headingMatch?.[1] || bodyMatch?.[1]
  if (!sizeStr) return undefined
  
  // Convert Title Case to UPPERCASE (e.g., "Large" → "LARGE")
  return sizeStr.toUpperCase()
}

// --- Helper: Pixel-based size mapping ---
// Falls back when no text style or style name doesn't match known patterns.
// Adjusted thresholds to avoid rendering text too large.
function mapFontSizeToAppian(px: number): string | undefined {
  if (px <= 12) return 'SMALL'
  if (px <= 14) return undefined   // STANDARD — omit to keep output clean
  if (px <= 16) return 'MEDIUM'
  if (px <= 19) return 'MEDIUM_PLUS'
  if (px <= 32) return 'LARGE'
  return 'EXTRA_LARGE'
}

/**
 * Main entry point: generates SAIL for a Figma TextNode.
 * Detects text styles and chooses between headingField or richTextDisplayField.
 */
export async function generateRichTextSAIL(
  node: TextNode,
  marginAbove?: string,
  marginBelow?: string
): Promise<string> {
  // --- Check if a text style is applied ---
  const textStyleId = node.textStyleId
  let styleName: string | undefined
  
  // Only proceed if textStyleId is a string (not figma.mixed or undefined)
  if (typeof textStyleId === 'string' && textStyleId !== '') {
    try {
      const style = await figma.getStyleByIdAsync(textStyleId) as TextStyle | null
      if (style) {
        styleName = style.name
      }
    } catch (_e) {
      // Style lookup failed; proceed without it
    }
  }

  // --- Case 1: Heading style → headingField ---
  if (styleName && styleName.includes('Heading')) {
    try {
      // Verify all text uses the same style (no mixed styling)
      const segments = node.getStyledTextSegments(['textStyleId'])
      const allSameStyle = segments.every(seg => 
        typeof seg.textStyleId === 'string' && seg.textStyleId === textStyleId
      )
      
      if (allSameStyle) {
        const text = node.characters || ''
        const size = parseSizeFromStyleName(styleName)
        
        // Check for decorations (bold/underline/strikethrough)
        const decoration: string[] = []
        if (typeof node.fontWeight === 'number' && node.fontWeight >= 600) {
          decoration.push('STRONG')
        }
        if (node.textDecoration === 'UNDERLINE') {
          decoration.push('UNDERLINE')
        }
        if (node.textDecoration === 'STRIKETHROUGH') {
          decoration.push('STRIKETHROUGH')
        }
        
        return headingField({
          text,
          size,
          decoration: decoration.length > 0 ? decoration : undefined,
        })
      }
    } catch (_e) {
      // getStyledTextSegments failed; fall through to richText logic
    }
  }

  // --- Case 2 & 3: Body text or mixed styles → richTextDisplayField ---
  let items: string[]

  try {
    // Verify the API is available (not all sandbox modes expose it)
    if (typeof node.getStyledTextSegments !== 'function') {
      throw new Error('getStyledTextSegments not available')
    }

    // Retrieve segments split by visual styling differences
    const segments = node.getStyledTextSegments(
      ['fontSize', 'fontName', 'fontWeight', 'textDecoration', 'fills', 'textStyleId']
    )

    if (!segments || segments.length === 0) {
      throw new Error('No segments returned')
    }

    const itemPromises = segments.map(async (seg) => {
      const text = seg.characters

      // --- Size detection ---
      let size: string | undefined
      
      // First, try to extract size from the segment's text style name
      if (seg.textStyleId && typeof seg.textStyleId === 'string') {
        try {
          const segStyle = await figma.getStyleByIdAsync(seg.textStyleId) as TextStyle | null
          if (segStyle && segStyle.name) {
            size = parseSizeFromStyleName(segStyle.name)
          }
        } catch (_e) {
          // Style lookup failed
        }
      }
      
      // Fall back to pixel-based detection if no style match
      if (!size) {
        size = mapFontSizeToAppian(seg.fontSize)
      }

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

    // Await all richTextItem promises
    items = await Promise.all(itemPromises)
  } catch (_e) {
    // Fallback: use plain text when getStyledTextSegments is unavailable
    const text = node.characters || ''
    items = [richTextItem({ text })]
  }

  return richTextDisplayField({ items, marginAbove, marginBelow })
}
