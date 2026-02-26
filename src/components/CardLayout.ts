// --- Frame / Card Layout Component ---
//
// Generates SAIL code for a FRAME node. Depending on the frame's properties and
// children, this may produce one of:
//   • a!buttonArrayLayout  – horizontal frame whose children are all buttons
//   • a!sideBySideLayout   – horizontal/vertical frame where each child contains one element
//   • a!columnsLayout       – horizontal/vertical frame with complex children
//   • a!cardLayout          – general case (frame with visual styling)
//
// Runs when the selected node is a FRAME.

import { isCardLayoutFrame, isCardLayoutCode, isSideBySideLayoutCode, isColumnsLayoutCode, getVariableValueName } from '../helpers'
import { cardLayout, sideBySideLayout, sideBySideItem, columnsLayout, columnLayout, richTextItem, richTextIcon, richTextDisplayField, generateButtonArrayLayout } from '../templates'
import { rgbToHex, indentCode } from '../utils'
import type { SAILNodeResult, NodeGenerator } from '../types'

/** Check whether generated SAIL is any layout component that cannot be nested inside sideBySideItem */
function isLayoutCode(code: string): boolean {
  return isCardLayoutCode(code) || isSideBySideLayoutCode(code) || isColumnsLayoutCode(code)
}

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

  // --- Card frames: flatten all transparent descendants, wrap in cardLayout ---
  // This MUST come before layout detection. Card frames never generate
  // sideBySideLayout / columnsLayout inside themselves — only flat leaf content.
  if (isCardLayoutFrame(node)) {
    const flatItems = await flattenFrameContents(node, generateForNode)
    const flatContents = groupFlatItems(flatItems)
    return wrapInCardLayout(node, flatContents)
  }

  // --- Transparent frames with autolayout: sideBySideLayout or columnsLayout ---
  if (
    (node.layoutMode === 'HORIZONTAL' || node.layoutMode === 'VERTICAL') &&
    Array.isArray(node.children) &&
    node.children.length > 0
  ) {
    // Determine layout type.
    // containsCardFrames is a fast synchronous check that prevents card frames
    // from ever ending up inside a sideBySideItem.
    const shouldUseSideBySide =
      !containsCardFrames(node) &&
      determineSideBySideLayout(node, generateForNode)

    if (shouldUseSideBySide) {
      // Generate sideBySideLayout with spacing, alignVertical, and width props
      const spacing = await getSpacingValue(node, 'sideBySide')
      const alignVertical = getAlignmentValue(node)
      
      const items: string[] = []
      for (const child of node.children) {
        // Skip invisible children
        if (!child.visible) continue
        
        // Check if child is a frame with only text/icon nodes - collapse into richTextDisplayField
        if (child.type === 'FRAME' && await isRichTextCompatibleFrame(child as FrameNode)) {
          const richTextField = await generateCollapsedRichText(child as FrameNode, generateForNode)
          if (richTextField) {
            const width = getWidthValue(child, 'sideBySide') || undefined
            items.push(sideBySideItem({ item: richTextField, width }))
            continue
          }
        }
        
        // If child is a transparent frame, extract its children directly to avoid nested layouts
        if (child.type === 'FRAME' && !isCardLayoutFrame(child as FrameNode)) {
          const transparentFrame = child as FrameNode
          for (const grandchild of transparentFrame.children) {
            if (!grandchild.visible) continue
            const grandchildResult = await generateForNode(grandchild)
            if (typeof grandchildResult === 'string' && grandchildResult.trim()) {
              // Never put layout components inside sideBySideItem
              if (isLayoutCode(grandchildResult)) continue
              const width = getWidthValue(grandchild, 'sideBySide') || undefined
              if (hasImageFill(grandchild)) {
                items.push(sideBySideItem({ item: grandchildResult, width: width || 'MINIMIZE' }))
              } else {
                items.push(sideBySideItem({ item: grandchildResult, width }))
              }
            } else if (grandchildResult && typeof grandchildResult === 'object' && grandchildResult.type === 'button') {
              const width = getWidthValue(grandchild, 'sideBySide') || undefined
              items.push(sideBySideItem({ item: grandchildResult.code, width }))
            }
          }
          continue
        }
        
        const childResult = await generateForNode(child)
        if (typeof childResult === 'string' && childResult.trim()) {
          // CHECK: Never nest layout components in sideBySideLayout
          // cardLayout, columnsLayout, and sideBySideLayout CANNOT be nested
          if (isCardLayoutCode(childResult) || 
              isColumnsLayoutCode(childResult) || 
              isSideBySideLayoutCode(childResult)) {
            // This should never happen if determineSideBySideLayout works correctly
            // But as a safety check, skip this child entirely
            console.warn('Attempted to nest layout component in sideBySideLayout - skipping')
            continue
          }
          
          // Images in sideBySideLayout default to MINIMIZE width
          let width = getWidthValue(child, 'sideBySide') || undefined
          if (hasImageFill(child)) {
            width = 'MINIMIZE'
          }
          items.push(sideBySideItem({ item: childResult, width }))
        } else if (childResult && typeof childResult === 'object' && childResult.type === 'button') {
          const width = getWidthValue(child, 'sideBySide') || undefined
          items.push(sideBySideItem({ item: childResult.code, width }))
        }
      }
      
      // If there are no valid items, fall through to cardLayout
      if (items.length === 0) {
        // Don't generate empty sideBySideLayout, use cardLayout instead
        const fallbackItems: FlatItem[] = []
        for (const child of node.children) {
          if (!child.visible) continue
          const childResult = await generateForNode(child)
          if (typeof childResult === 'string' && childResult.trim()) {
            fallbackItems.push({ kind: 'content', code: childResult })
          } else if (childResult && typeof childResult === 'object' && childResult.type === 'button') {
            fallbackItems.push({ kind: 'button', code: childResult.code })
          }
        }
        return wrapInCardLayout(node, groupFlatItems(fallbackItems))
      }
      
      const sideBySideCode = sideBySideLayout({ 
        items, 
        spacing: spacing || undefined, 
        alignVertical: alignVertical || undefined 
      })
      
      return sideBySideCode
    } else {
      // Generate columnsLayout with spacing, alignVertical, and width props
      const spacing = await getSpacingValue(node, 'columns')
      const alignVertical = getAlignmentValue(node)
      
      const columns: string[] = []
      for (const child of node.children) {
        // Skip invisible children
        if (!child.visible) continue
        
        const childContents: string[] = []
        
        // Check if child is a frame with only text/icon nodes - collapse into richTextDisplayField
        if (child.type === 'FRAME' && await isRichTextCompatibleFrame(child as FrameNode)) {
          const richTextField = await generateCollapsedRichText(child as FrameNode, generateForNode)
          if (richTextField) {
            childContents.push(richTextField)
          }
        } else if (child.type === 'FRAME' && !isCardLayoutFrame(child as FrameNode)) {
          // Transparent frame - extract its children directly to avoid nested layouts
          const transparentFrame = child as FrameNode
          for (const grandchild of transparentFrame.children) {
            if (!grandchild.visible) continue
            const grandchildResult = await generateForNode(grandchild)
            if (typeof grandchildResult === 'string' && grandchildResult.trim()) {
              childContents.push(grandchildResult)
            } else if (grandchildResult && typeof grandchildResult === 'object' && grandchildResult.type === 'button') {
              childContents.push(grandchildResult.code)
            }
          }
        } else {
          // Process the child normally - this handles frames, images, text, buttons, etc.
          const childResult = await generateForNode(child)
          
          if (typeof childResult === 'string' && childResult.trim()) {
            childContents.push(childResult)
          } else if (childResult && typeof childResult === 'object' && childResult.type === 'button') {
            childContents.push(childResult.code)
          }
        }
        
        // Only add column if it has content
        if (childContents.length > 0) {
          const width = getWidthValue(child, 'columns')
          columns.push(columnLayout({ contents: childContents, width: width || undefined }))
        }
      }
      
      const columnsCode = columnsLayout({ 
        columns, 
        spacing: spacing || undefined, 
        alignVertical: alignVertical || undefined 
      })
      
      return columnsCode
    }
  }

  // --- Fallback: wrap in cardLayout (transparent wrapper or frame with no autolayout) ---
  // Card frames with visual styling are already handled above.
  // This path is for transparent frames that didn't match layout detection.
  const flatItems = await flattenFrameContents(node, generateForNode)
  contents = groupFlatItems(flatItems)
  
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

  // --- Apply marginBelow to stacked cardLayouts based on itemSpacing (gap) ---
  if (node.layoutMode === 'VERTICAL' && typeof node.itemSpacing === 'number' && node.itemSpacing > 0) {
    const gap = node.itemSpacing
    let gapMargin: string | undefined
    
    // Map gap to marginBelow values
    if (gap >= 29) gapMargin = 'EVEN_MORE'
    else if (gap >= 15) gapMargin = 'MORE'
    else if (gap >= 8) gapMargin = 'STANDARD'
    else if (gap >= 5) gapMargin = 'LESS'
    else if (gap >= 1) gapMargin = 'EVEN_LESS'
    
    if (gapMargin && finalContents.length > 0) {
      finalContents = finalContents.map((content, index) => {
        // Apply marginBelow to all cardLayouts except the last one
        if (index < finalContents.length - 1 && /^a!cardLayout\(/.test(content)) {
          // Replace existing marginBelow: "NONE" or add it
          if (/\bmarginBelow:\s*"NONE"/.test(content)) {
            return content.replace(
              /\bmarginBelow:\s*"NONE"/,
              `marginBelow: "${gapMargin}"`
            )
          }
        }
        return content
      })
    }
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

/**
 * Determine if a frame should use sideBySideLayout vs columnsLayout.
 * Returns true if sideBySideLayout should be used.
 *
 * NOTE: the caller already guarantees containsCardFrames(node) is false,
 *       so we only need to check for structural complexity here.
 */
function determineSideBySideLayout(node: FrameNode, _generateForNode: NodeGenerator): boolean {
  for (const child of node.children) {
    if (!child.visible) continue

    // Simple leaf nodes are always sideBySide candidates
    if (child.type === 'TEXT' || (child.type === 'RECTANGLE' && hasImageFill(child))) {
      continue
    }
    if (child.type === 'INSTANCE') {
      continue
    }

    if (child.type === 'FRAME') {
      const frameNode = child as FrameNode
      const frameChildren = frameNode.children.filter(c => c.visible)

      // Empty frame — skip
      if (frameChildren.length === 0) continue

      // Frame with only simple leaf children (text / instances) — sideBySide ok
      if (frameChildren.every(c => c.type === 'TEXT' || c.type === 'INSTANCE')) {
        continue
      }

      // Single child frame — sideBySide ok
      if (frameChildren.length === 1) continue
    }

    // Anything else is complex → columnsLayout
    return false
  }
  return true
}

/**
 * Get spacing value from variable or fallback to threshold mapping
 */
async function getSpacingValue(node: FrameNode, layoutType: 'sideBySide' | 'columns'): Promise<string | null> {
  // Try to get variable name first
  const variableName = await getVariableValueName(node, 'itemSpacing')
  if (variableName) {
    return variableName
  }
  
  // Fallback to threshold mapping
  const gap = node.itemSpacing || 0
  
  if (layoutType === 'sideBySide') {
    // Thresholds for sideBySideLayout: 0=NONE, 10=SPARSE, 20=STANDARD, 30=DENSE
    if (gap === 0) return 'NONE'
    if (gap <= 10) return 'SPARSE'
    if (gap <= 20) return 'STANDARD'
    return 'DENSE'
  } else {
    // Thresholds for columnsLayout (similar to sideBySide for now)
    if (gap === 0) return 'NONE'
    if (gap <= 10) return 'SPARSE'
    if (gap <= 20) return 'STANDARD'
    return 'DENSE'
  }
}

/**
 * Get alignment value based on counterAxisAlignItems
 */
function getAlignmentValue(node: FrameNode): string | null {
  const alignment = node.counterAxisAlignItems
  if (alignment === 'MIN') return 'TOP'
  if (alignment === 'MAX') return 'BOTTOM'
  if (alignment === 'CENTER') return 'MIDDLE'
  return null
}

/**
 * Get width value based on child sizing mode
 */
function getWidthValue(child: SceneNode, layoutType: 'sideBySide' | 'columns'): string | null {
  if (!('layoutSizingHorizontal' in child)) return null
  
  const sizing = (child as any).layoutSizingHorizontal
  if (sizing === 'HUG') {
    return layoutType === 'sideBySide' ? 'MINIMIZE' : 'AUTO'
  }
  
  return null
}

/**
 * Check if a node has an image fill
 */
function hasImageFill(node: SceneNode): boolean {
  if (!('fills' in node)) return false
  const fills = (node as any).fills
  return Array.isArray(fills) && fills.some((f: any) => f.type === 'IMAGE')
}

/**
 * Check (synchronously) whether any descendant of a frame is a card frame.
 * Recurses through transparent frames only.
 */
function containsCardFrames(frame: FrameNode): boolean {
  for (const child of frame.children) {
    if (!child.visible) continue
    if (child.type === 'FRAME') {
      if (isCardLayoutFrame(child as FrameNode)) return true
      if (containsCardFrames(child as FrameNode)) return true
    }
  }
  return false
}

/**
 * Generate a sideBySideLayout for a horizontal frame.
 * Recursively flattens nested horizontal transparent frames so that
 * [FrameH [icon, text], FrameH [icon, text]] becomes 4 flat sideBySideItems
 * instead of 2 nested sideBySideLayouts.
 *
 * Icon items (detected from the generated code containing `a!richTextIcon(`)
 * get width: "MINIMIZE" automatically.
 */
async function generateSideBySideForFrame(
  frame: FrameNode,
  generateForNode: NodeGenerator
): Promise<string | null> {
  const items: string[] = []

  // Collect leaf items recursively, flattening nested horizontal transparent frames
  await collectSideBySideItems(frame, generateForNode, items)

  if (items.length === 0) return null
  return sideBySideLayout({ items })
}

/**
 * Recursively collect sideBySideItems from a frame.  Nested horizontal
 * transparent frames are walked-through so their children become direct
 * items in the same sideBySideLayout.  Only leaf nodes (text, icon, image,
 * button) are turned into sideBySideItems.
 */
async function collectSideBySideItems(
  frame: FrameNode,
  generateForNode: NodeGenerator,
  items: string[]
): Promise<void> {
  for (const child of frame.children) {
    if (!child.visible) continue

    // ANY sub-frame → always recurse into it to extract leaf items.
    if (child.type === 'FRAME') {
      await collectSideBySideItems(child as FrameNode, generateForNode, items)
      continue
    }

    // For non-FRAME nodes, try generating code first
    const childResult = await generateForNode(child)
    let code: string | undefined

    if (typeof childResult === 'string' && childResult.trim()) {
      code = childResult
    } else if (childResult && typeof childResult === 'object' && childResult.type === 'button') {
      code = childResult.code
    }

    // If generateForNode returned nothing for an INSTANCE, try icon extraction
    // directly — the instance may not have "icon" in its name but still be
    // a valid Font Awesome icon component (e.g. "id-card", "user-circle-o").
    if (!code && child.type === 'INSTANCE') {
      code = await tryGenerateIconFromInstance(child as InstanceNode)
    }

    if (code) {
      // Skip layout components that somehow made it through
      if (isLayoutCode(code)) continue

      // Detect icons from the generated SAIL to set width: "MINIMIZE"
      const isIcon = code.includes('a!richTextIcon(')
      items.push(sideBySideItem({
        item: code,
        width: isIcon ? 'MINIMIZE' : undefined
      }))
    } else if ('children' in child && (child as any).children?.length > 0) {
      // If still nothing but the node has children, recurse into them
      await collectSideBySideItems(child as any, generateForNode, items)
    }
  }
}

/**
 * Try to generate a richTextDisplayField wrapping a richTextIcon for an
 * INSTANCE node.  Does NOT require "icon" in the name — if the component
 * name yields a valid lowercase-hyphen slug, we generate an icon for it.
 * Returns undefined if it can’t produce a valid icon.
 */
async function tryGenerateIconFromInstance(node: InstanceNode): Promise<string | undefined> {
  const props = await extractIconProperties(node)
  if (!props.name) return undefined
  const iconCode = richTextIcon({
    icon: props.name,
    size: props.size,
    color: props.color
  })
  return richTextDisplayField({ items: [iconCode] })
}

/**
 * Recursively extract leaf content from a frame, flattening all transparent
 * sub-frames.  Only calls generateForNode on leaf nodes (text, images,
 * icons, buttons) and on sub-card frames.  Transparent intermediate frames
 * are walked through WITHOUT generating any layout component.
 *
 * EXCEPTION: Horizontal transparent frames with multiple visible children
 * are NOT flattened — they produce a sideBySideLayout so that horizontal
 * arrangement (e.g. icon + text pairs) is preserved.
 *
 * Returns tagged items so buttons can be grouped into buttonArrayLayout.
 */
type FlatItem = { kind: 'content', code: string } | { kind: 'button', code: string }

async function flattenFrameContents(
  node: FrameNode,
  generateForNode: NodeGenerator
): Promise<FlatItem[]> {
  const results: FlatItem[] = []

  for (const child of node.children) {
    if (!child.visible) continue

    if (child.type === 'FRAME') {
      const frame = child as FrameNode
      const visibleKids = frame.children.filter(c => c.visible)

      // HORIZONTAL frame with multiple children → always flatten into
      // sideBySideLayout, even if the frame has fills (isCardLayoutFrame).
      // Inside a card we never want nested layouts from sub-frames.
      if (frame.layoutMode === 'HORIZONTAL' && visibleKids.length > 1) {
        const sbsCode = await generateSideBySideForFrame(frame, generateForNode)
        if (sbsCode) {
          results.push({ kind: 'content', code: sbsCode })
          continue
        }
      }

      // Non-card transparent frame → recurse (flatten its children)
      if (!isCardLayoutFrame(frame)) {
        const nested = await flattenFrameContents(frame, generateForNode)
        results.push(...nested)
        continue
      }
    }

    // Everything else (text, image, icon, button, sub-card frame) → generate normally
    const childResult = await generateForNode(child)
    if (typeof childResult === 'string' && childResult.trim()) {
      results.push({ kind: 'content', code: childResult })
    } else if (childResult && typeof childResult === 'object' && childResult.type === 'button') {
      results.push({ kind: 'button', code: childResult.code })
    } else if (child.type === 'INSTANCE') {
      // Unrecognized instance → try icon extraction directly
      const iconCode = await tryGenerateIconFromInstance(child as InstanceNode)
      if (iconCode) {
        results.push({ kind: 'content', code: iconCode })
      }
    } else if ('children' in child && (child as any).children?.length > 0) {
      // Node returned nothing but has children (e.g. GROUP wrapper) → recurse
      const nested = await flattenFrameContents(child as any, generateForNode)
      results.push(...nested)
    }
  }

  return results
}

/**
 * Convert tagged flat items into final SAIL strings, grouping consecutive
 * buttons into a!buttonArrayLayout().
 */
function groupFlatItems(items: FlatItem[], buttonAlign?: string): string[] {
  const results: string[] = []
  let buttonBuffer: string[] = []

  function flushButtons() {
    if (buttonBuffer.length > 0) {
      results.push(generateButtonArrayLayout(buttonBuffer, buttonAlign))
      buttonBuffer = []
    }
  }

  for (const item of items) {
    if (item.kind === 'button') {
      buttonBuffer.push(item.code)
    } else {
      flushButtons()
      results.push(item.code)
    }
  }
  flushButtons()
  return results
}

/**
 * Check if an instance node is an icon component.
 * Looks for "icon" (case-insensitive) in:
 *   1. Component set name  (parent of main component)
 *   2. Main component name
 *   3. Instance node name
 */
async function isIconComponent(node: InstanceNode): Promise<boolean> {
  try {
    // Quick check on the instance name itself
    if (/icon/i.test(node.name)) return true

    const mainComponent = await node.getMainComponentAsync()
    if (!mainComponent) return false

    // Check main component name
    if (/icon/i.test(mainComponent.name)) return true

    // Check component set name
    if (
      mainComponent.parent &&
      mainComponent.parent.type === 'COMPONENT_SET' &&
      /icon/i.test(mainComponent.parent.name)
    ) {
      return true
    }
  } catch (_e) {
    // Failed to get main component
  }
  return false
}

/**
 * Extract icon properties from an icon instance
 * Returns: { name, size, color }
 */
async function extractIconProperties(node: InstanceNode): Promise<{ name: string, size?: string, color?: string }> {
  // Get the icon name from the component name, stripping path segments
  const mainComponent = await node.getMainComponentAsync()
  const rawName = mainComponent?.name || node.name
  const iconName = extractIconSlug(rawName)
  if (!iconName) return { name: '', size: undefined, color: undefined }
  
  // Get size: first check for "Icon Sizes/" variable, then pixel height
  let size: string | undefined = await getIconSizeFromVariable(node)
  if (!size) {
    size = mapIconPixelSize(node.height)
  }
  
  // Get color: recurse into children to find the actual vector fill
  const color = getIconColor(node)
  
  return { name: iconName!, size, color }
}

/**
 * Get icon color by recursing into instance children to find a visible
 * vector/shape with a solid fill.  Skips pure white (likely background).
 */
function getIconColor(node: SceneNode): string | undefined {
  if ('fills' in node) {
    const fills = (node as any).fills
    if (Array.isArray(fills)) {
      for (const fill of fills) {
        if (fill.type === 'SOLID' && fill.visible !== false) {
          const hex = rgbToHex(fill.color)
          if (hex !== '#FFFFFF' && hex !== '#ffffff') return hex
        }
      }
    }
  }
  if ('children' in node) {
    for (const child of (node as any).children) {
      if (!child.visible) continue
      const c = getIconColor(child)
      if (c) return c
    }
  }
  return undefined
}

/**
 * Check for a bound variable starting with "Icon Sizes/" on height.
 */
async function getIconSizeFromVariable(node: InstanceNode): Promise<string | undefined> {
  try {
    const boundVar = (node as any).boundVariables?.['height']
    const varId = Array.isArray(boundVar) ? boundVar[0]?.id : boundVar?.id
    if (!varId) return undefined
    const variable = await figma.variables.getVariableByIdAsync(varId)
    if (!variable || !variable.name.startsWith('Icon Sizes/')) return undefined
    const sizePart = variable.name.replace('Icon Sizes/', '').trim()
    return sizePart.toUpperCase().replace(/\s+/g, '_')
  } catch {
    return undefined
  }
}

/**
 * Map icon pixel height to Appian icon size.  STANDARD = 14px baseline.
 */
function mapIconPixelSize(px: number): string | undefined {
  if (px <= 10) return 'SMALL'
  if (px <= 14) return undefined  // STANDARD — omit
  if (px <= 16) return 'MEDIUM'
  if (px <= 19) return 'MEDIUM_PLUS'
  if (px <= 32) return 'LARGE'
  return 'EXTRA_LARGE'
}

/**
 * Extract a valid Font Awesome icon slug (lowercase, hyphens) from a
 * Figma layer / component name like "icon/Rich Text Icon/user-circle-o".
 * Returns null when no valid slug can be found.
 */
function extractIconSlug(rawName: string): string | null {
  const segments = rawName.split('/')
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i].trim()
    if (/^[a-z][a-z0-9-]*$/.test(seg)) return seg
  }
  const fallback = rawName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  if (/^[a-z][a-z0-9-]*$/.test(fallback)) return fallback
  return null
}

/**
 * Check if a frame contains only text nodes and/or icon instances
 * These can be collapsed into a single richTextDisplayField
 */
async function isRichTextCompatibleFrame(frame: FrameNode): Promise<boolean> {
  if (!Array.isArray(frame.children) || frame.children.length === 0) return false
  const visibleChildren = frame.children.filter(c => c.visible)
  if (visibleChildren.length === 0) return false
  
  // Check if all children are either TEXT or icon INSTANCE nodes
  for (const child of visibleChildren) {
    if (child.type === 'TEXT') {
      continue // Text is OK
    } else if (child.type === 'INSTANCE') {
      const isIcon = await isIconComponent(child as InstanceNode)
      if (isIcon) {
        continue // Icon is OK
      } else {
        return false // Non-icon instance
      }
    } else {
      return false // Other node type
    }
  }
  
  return true
}

/**
 * Generate a richTextDisplayField with multiple richTextItems/richTextIcons from text and icon nodes
 * Converts headings to richTextItems instead of headingFields
 * Handles both horizontal (inline) and vertical (stacked with line breaks) layouts
 */
async function generateCollapsedRichText(frame: FrameNode, generateForNode: NodeGenerator): Promise<string | null> {
  if (!(await isRichTextCompatibleFrame(frame))) return null
  
  const richTextItems: string[] = []
  
  // Check layout mode to determine if we need line breaks
  const isVerticalLayout = frame.layoutMode === 'VERTICAL'
  
  for (const child of frame.children) {
    // Skip invisible children
    if (!child.visible) continue
    
    if (child.type === 'TEXT') {
      const textNode = child as TextNode
      
      // Check if this is a heading by checking the text style
      let isHeading = false
      let size = 'STANDARD'
      const styles: string[] = []
      
      if (textNode.textStyleId && textNode.textStyleId !== figma.mixed) {
        try {
          const style = await figma.getStyleByIdAsync(textNode.textStyleId as string)
          if (style && style.name.toLowerCase().includes('heading')) {
            isHeading = true
            
            // Extract size from style name
            const styleName = style.name
            if (styleName.includes('Large') || styleName.includes('XL')) {
              size = 'LARGE'
            } else if (styleName.includes('Medium')) {
              size = 'MEDIUM'
            } else if (styleName.includes('Small')) {
              size = 'SMALL'
            }
          } else if (style) {
            // Not a heading style — try "Body/[Size] Text" pattern
            const bodyMatch = style.name.match(/Body\/([A-Za-z_]+)\s+Text/)
            if (bodyMatch) {
              size = bodyMatch[1].toUpperCase().replace(/\s+/g, '_')
            }
          }
        } catch (_e) {
          // Style lookup failed, continue
        }
      }

      // Fallback: pixel-based size detection
      if (size === 'STANDARD' && !isHeading) {
        const fontSize = textNode.fontSize
        if (typeof fontSize === 'number') {
          if (fontSize <= 12) size = 'SMALL'
          else if (fontSize <= 14) size = 'STANDARD'
          else if (fontSize <= 16) size = 'MEDIUM'
          else if (fontSize <= 19) size = 'MEDIUM_PLUS'
          else if (fontSize <= 32) size = 'LARGE'
          else size = 'EXTRA_LARGE'
        }
      }
      
      // Check for font weight (bold)
      const fontWeight = textNode.fontWeight
      
      if (isHeading || (typeof fontWeight === 'number' && fontWeight >= 600)) {
        styles.push('STRONG')
      }
      
      // Get text color
      let color = ''
      if (textNode.fills && Array.isArray(textNode.fills) && textNode.fills.length > 0) {
        const fill = textNode.fills[0]
        if (fill.type === 'SOLID') {
          color = rgbToHex(fill.color)
        }
      }
      
      // Build richTextItem using template
      const text = textNode.characters
      const item = richTextItem({
        text,
        size: size !== 'STANDARD' ? size : undefined,
        style: styles.length > 0 ? styles : undefined,
        color: color || undefined
      })
      
      richTextItems.push(item)
    } else if (child.type === 'INSTANCE') {
      // Handle icon instances
      const iconInstance = child as InstanceNode
      const isIcon = await isIconComponent(iconInstance)
      
      if (isIcon) {
        const iconProps = await extractIconProperties(iconInstance)
        const item = richTextIcon({
          icon: iconProps.name,
          size: iconProps.size,
          color: iconProps.color
        })
        
        richTextItems.push(item)
      }
    }
  }
  
  if (richTextItems.length === 0) return null
  
  // Add line breaks between items for vertical layout
  let itemsWithLineBreaks: string[]
  if (isVerticalLayout) {
    itemsWithLineBreaks = []
    for (let i = 0; i < richTextItems.length; i++) {
      itemsWithLineBreaks.push(richTextItems[i])
      // Add line break after each item except the last one
      if (i < richTextItems.length - 1) {
        itemsWithLineBreaks.push('a!richTextItem(text: char(10))')
      }
    }
  } else {
    // Horizontal layout - no line breaks
    itemsWithLineBreaks = richTextItems
  }
  
  return `a!richTextDisplayField(
    labelPosition: "COLLAPSED",
    value: {
${itemsWithLineBreaks.map(item => indentCode(item, 6)).join(',\n')}
    }
  )`
}

/**
 * Wrap content in cardLayout with visual styling from the frame
 */
function wrapInCardLayout(node: FrameNode, contents: string[]): string {
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

    if (hasLeft) {
      paddingValue = mapPadding(node.paddingLeft)
    } else if (hasRight) {
      paddingValue = mapPadding(node.paddingRight)
    } else if (hasTop || hasBottom) {
      // Don't set padding for top/bottom only
      paddingValue = 'NONE'
    } else {
      paddingValue = 'NONE'
    }
  } else {
    paddingValue = 'NONE'
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

  return cardLayout({
    padding: paddingValue,
    marginAbove: marginAboveValue,
    marginBelow: marginBelowValue,
    shape: shapeValue || undefined,
    style: styleValue,
    borderColor,
    showBorder,
    showShadow,
    contents
  })
}
