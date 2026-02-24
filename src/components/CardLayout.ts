// --- Frame / Card Layout Component ---
//
// Generates SAIL code for a FRAME node. Depending on the frame's properties and
// children, this may produce one of:
//   • a!buttonArrayLayout  – horizontal frame whose children are all buttons
//   • a!sideBySideLayout   – horizontal frame with no fill/stroke
//   • a!cardLayout          – general case (frame with visual styling)
//
// Runs when the selected node is a FRAME.

import { isCardLayoutFrame, isCardLayoutCode, isSideBySideLayoutCode } from '../helpers'
import { cardLayout } from '../templates'
import { rgbToHex, indentCode } from '../utils'
import type { SAILNodeResult, NodeGenerator } from '../types'

/**
 * Main entry point for generating SAIL from a FRAME node.
 *
 * @param node            The Figma FRAME node
 * @param contents        Pre-processed SAIL strings for the frame's children
 * @param generateForNode Callback for recursive codegen (avoids circular imports)
 */
export async function generateFrameSAIL(
  node: FrameNode,
  contents: string[],
  generateForNode: NodeGenerator
): Promise<string> {

  // --- Special case: horizontal autolayout with only buttons → buttonArrayLayout ---
  if (
    node.layoutMode === 'HORIZONTAL' &&
    Array.isArray(node.children) &&
    node.children.length > 0
  ) {
    const childResults = await Promise.all(node.children.map(child => generateForNode(child)))
    const allButtons = childResults.every(
      cr => cr && typeof cr === 'object' && cr.type === 'button'
    )
    if (allButtons) {
      const buttonCodes = childResults.map(cr => (cr as { code: string }).code)
      let alignProp = ''
      if (node.primaryAxisAlignItems === 'MAX') {
        alignProp = ',\n  align: "END"'
      } else if (node.primaryAxisAlignItems === 'CENTER') {
        alignProp = ',\n  align: "CENTER"'
      }
      return `a!buttonArrayLayout(
  buttons: {
    ${buttonCodes.join(',\n    ')}
  }${alignProp},
  marginBelow: "NONE"
)`
    }
  }

  // --- SideBySideLayout for horizontal autolayout with no fill/stroke ---
  if (
    node.layoutMode === 'HORIZONTAL' &&
    !isCardLayoutFrame(node) &&
    Array.isArray(node.children)
  ) {
    let hasCardChildOrSideBySide = false
    const itemBlocks = await Promise.all(
      node.children.map(async (child) => {
        if (child.type === 'FRAME' && isCardLayoutFrame(child)) {
          hasCardChildOrSideBySide = true
        }
        const childResult = await generateForNode(child)
        if (typeof childResult === 'string' && childResult.trim()) {
          if (isCardLayoutCode(childResult) || isSideBySideLayoutCode(childResult)) {
            hasCardChildOrSideBySide = true
            return null
          }
          return `a!sideBySideItem(
  item: ${childResult}
)`
        }
        if (childResult && typeof childResult === 'object' && childResult.type === 'button') {
          return `a!sideBySideItem(
  item: ${childResult.code}
)`
        }
        return null
      })
    )
    if (!hasCardChildOrSideBySide) {
      const filteredItems = itemBlocks.filter(Boolean)
      return `a!sideBySideLayout(
  items: {
${filteredItems.filter((i): i is string => i !== null).map(i => indentCode(i, 4)).join(',\n')}
  }
)`
    }
    // If any child is a card or sideBySide, fall through to cardLayout logic below
  }

  // --- Padding and margin mapping ---
  let paddingValue: string | undefined = undefined
  let marginAboveValue: string | undefined = undefined
  let marginBelowValue: string | undefined = undefined

  if (node.layoutMode && node.layoutMode !== 'NONE') {
    const hasLeft = typeof node.paddingLeft === 'number' && node.paddingLeft > 0
    const hasRight = typeof node.paddingRight === 'number' && node.paddingRight > 0
    const hasTop = typeof node.paddingTop === 'number' && node.paddingTop > 0
    const hasBottom = typeof node.paddingBottom === 'number' && node.paddingBottom > 0

    function mapPadding(val: number): string {
      if (val >= 33) return 'EVEN_MORE'
      if (val >= 25) return 'MORE'
      if (val >= 13) return 'STANDARD'
      if (val >= 7) return 'LESS'
      if (val >= 1) return 'EVEN_LESS'
      return 'NONE'
    }
    function mapMargin(val: number): string {
      if (val >= 29) return 'EVEN_MORE'
      if (val >= 15) return 'MORE'
      if (val >= 8) return 'STANDARD'
      if (val >= 5) return 'LESS'
      if (val >= 1) return 'EVEN_LESS'
      return 'NONE'
    }

    if (hasLeft) {
      paddingValue = mapPadding(node.paddingLeft)
    } else if (hasRight) {
      paddingValue = mapPadding(node.paddingRight)
    } else if (hasTop || hasBottom) {
      marginAboveValue = hasTop ? mapMargin(node.paddingTop) : undefined
      marginBelowValue = hasBottom ? mapMargin(node.paddingBottom) : undefined
    } else {
      paddingValue = 'NONE'
    }
  } else {
    paddingValue = 'NONE'
  }

  // --- Apply marginAbove/marginBelow to supported children if needed ---
  let finalContents = contents
  if ((marginAboveValue || marginBelowValue) && contents.length > 0) {
    finalContents = contents.map(content => {
      // Only works for a!buttonArrayLayout and a!richTextDisplayField
      if (/^a!buttonArrayLayout\(/.test(content)) {
        let updated = content.replace(
          /\bmarginBelow:\s*"NONE"/,
          marginBelowValue ? `marginBelow: "${marginBelowValue}"` : 'marginBelow: "NONE"'
        )
        if (marginAboveValue) {
          updated = updated.replace(
            /^a!buttonArrayLayout\(/,
            `a!buttonArrayLayout(\n  marginAbove: "${marginAboveValue}",`
          )
        }
        return updated
      }
      if (/^a!richTextDisplayField\(/.test(content)) {
        let updated = content
        if (marginAboveValue) {
          updated = updated.replace(
            /^a!richTextDisplayField\(/,
            `a!richTextDisplayField(\n  marginAbove: "${marginAboveValue}",`
          )
        }
        if (marginBelowValue) {
          updated = updated.replace(
            /\)$/,
            `,\n  marginBelow: "${marginBelowValue}"\n)`
          )
        }
        return updated
      }
      return content
    })
  }

  // --- Card layout visual props ---
  let shapeValue = ''
  if (typeof node.cornerRadius === 'number') {
    if (node.cornerRadius === 0) shapeValue = 'SQUARED'
    else if (node.cornerRadius === 4) shapeValue = 'SEMI_ROUNDED'
    else if (node.cornerRadius === 8) shapeValue = 'ROUNDED'
  }
  let styleValue = 'TRANSPARENT'
  if (node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
    const fill = node.fills[0]
    if (fill.type === 'SOLID' && fill.opacity !== 0) {
      styleValue = rgbToHex(fill.color)
    }
  }
  let borderColor: string | undefined = undefined
  let showBorder = false
  if (node.strokes && Array.isArray(node.strokes) && node.strokes.length > 0) {
    showBorder = true
    const stroke = node.strokes[0]
    if (stroke.type === 'SOLID') {
      borderColor = rgbToHex(stroke.color)
    }
  }
  let showShadow = false
  if (node.effects && node.effects.some(e => e.type === 'DROP_SHADOW' && e.visible !== false)) {
    showShadow = true
  }

  // Compose cardLayout
  return cardLayout({
    padding: paddingValue,
    marginAbove: marginAboveValue,
    marginBelow: marginBelowValue,
    shape: shapeValue || undefined,
    style: styleValue,
    borderColor,
    showBorder,
    showShadow,
    contents: finalContents
  })
}
