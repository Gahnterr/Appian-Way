// --- Main Recursive Codegen Router ---
//
// Inspects a Figma node and dispatches to the appropriate component handler.
// New component types can be added by importing their handler and adding a
// case to the routing logic below.

import type { SAILNodeResult } from './types'
import { generateButtonSAIL } from './components/ButtonWidget'
import { generateRichTextSAIL } from './components/RichTextDisplayField'
import { generateFrameSAIL } from './components/CardLayout'
import { generateImageFieldSAIL } from './components/ImageField'
import { generateButtonArrayLayout, richTextIcon, richTextDisplayField } from './templates'
import { rgbToHex } from './utils'

/** Check whether a node has at least one image fill */
function hasImageFill(node: BaseNode): boolean {
  if (!('fills' in node)) return false
  const fills = (node as GeometryMixin).fills
  return Array.isArray(fills) && fills.some(f => f.type === 'IMAGE')
}

/**
 * Generate SAIL code for an icon instance
 * Icons are rendered as richTextDisplayField with a single richTextIcon
 */
/**
 * Extract a valid Font Awesome icon slug (lowercase, hyphens) from a
 * Figma layer / component name like "icon/Rich Text Icon/user-circle-o".
 * Returns null when no valid slug can be found.
 */
function extractIconSlug(rawName: string): string | null {
  // Split on '/' and look for a segment that is all lowercase + hyphens
  const segments = rawName.split('/')
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i].trim()
    if (/^[a-z][a-z0-9-]*$/.test(seg)) return seg
  }
  // Fallback: try the whole string lowercased, stripped of non-slug chars
  const fallback = rawName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  if (/^[a-z][a-z0-9-]*$/.test(fallback)) return fallback
  return null
}

async function generateIconSAIL(node: InstanceNode): Promise<string> {
  // Get the icon name from the component name
  const mainComponent = await node.getMainComponentAsync()
  const rawName = mainComponent?.name || node.name
  const iconName = extractIconSlug(rawName)
  if (!iconName) return '' // skip unrecognised icon
  
  // Get size: first check for "Icon Sizes/" variable, then pixel height
  let size: string | undefined = await getIconSizeFromVariable(node)
  if (!size) {
    size = mapIconPixelSize(node.height)
  }
  
  // Get color: recurse into children to find the actual vector fill
  const color = getIconColor(node)
  
  const icon = richTextIcon({
    icon: iconName!,
    size,
    color
  })
  
  return richTextDisplayField({
    items: [icon]
  })
}

/**
 * Get icon color by recursing into instance children to find a visible
 * vector/shape with a solid fill.  Icon instances often have a white
 * background or invisible wrapper — the actual colour lives on the
 * nested VECTOR, BOOLEAN_OPERATION, or child FRAME.
 */
function getIconColor(node: SceneNode): string | undefined {
  // Try fills on the node itself (but skip pure white — likely background)
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
  // Recurse into children
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
 * Check for a bound variable starting with "Icon Sizes/" on the node's
 * height property and map it to an Appian icon size.
 */
async function getIconSizeFromVariable(node: InstanceNode): Promise<string | undefined> {
  try {
    const boundVar = (node as any).boundVariables?.['height']
    const varId = Array.isArray(boundVar) ? boundVar[0]?.id : boundVar?.id
    if (!varId) return undefined
    const variable = await figma.variables.getVariableByIdAsync(varId)
    if (!variable || !variable.name.startsWith('Icon Sizes/')) return undefined
    // "Icon Sizes/Medium Plus" → "MEDIUM_PLUS"
    const sizePart = variable.name.replace('Icon Sizes/', '').trim()
    return sizePart.toUpperCase().replace(/\s+/g, '_')
  } catch {
    return undefined
  }
}

/**
 * Map icon pixel height to Appian icon size.
 * STANDARD = 14px baseline.
 */
function mapIconPixelSize(px: number): string | undefined {
  if (px <= 10) return 'SMALL'
  if (px <= 14) return undefined  // STANDARD — omit
  if (px <= 16) return 'MEDIUM'
  if (px <= 19) return 'MEDIUM_PLUS'
  if (px <= 32) return 'LARGE'
  return 'EXTRA_LARGE'
}

export async function generateSAILForNode(node: BaseNode): Promise<SAILNodeResult> {

  // --- Instance nodes (component instances like Button, Icons) ---
  if (node.type === 'INSTANCE') {
    const mainComponent = await node.getMainComponentAsync()
    if (
      mainComponent &&
      mainComponent.parent &&
      mainComponent.parent.type === 'COMPONENT_SET'
    ) {
      // Exact match for Button component set
      if (mainComponent.parent.name === 'Button') {
        return { type: 'button', code: await generateButtonSAIL(node) }
      }
      // Match icon component sets (case-insensitive)
      if (/icon/i.test(mainComponent.parent.name)) {
        return await generateIconSAIL(node)
      }
    }

    // Fallback: detect icons by component name or instance name
    if (
      (mainComponent && /icon/i.test(mainComponent.name)) ||
      /icon/i.test(node.name)
    ) {
      return await generateIconSAIL(node)
    }
  }

  // --- Text nodes → Rich Text Display Field ---
  if (node.type === 'TEXT') {
    try {
      return await generateRichTextSAIL(node as TextNode)
    } catch (_e) {
      const chars = String((node as TextNode).characters ?? '')
      return `a!richTextDisplayField(
  labelPosition: "COLLAPSED",
  value: {
    a!richTextItem(
      text: "${chars.replace(/"/g, '\\"')}"
    )
  }
)`
    }
  }

  // --- Image fills → Image Field ---
  if (hasImageFill(node)) {
    return generateImageFieldSAIL(node as SceneNode)
  }

  // --- Frame nodes → Card Layout / SideBySide / ButtonArray ---
  if (node.type === 'FRAME') {
    // generateFrameSAIL handles all child processing internally.
    // Passing empty contents avoids duplicate child traversal (which caused lag).
    return await generateFrameSAIL(node, [], generateSAILForNode)
  }

  // --- Unrecognized node ---
  return ''
}
