// --- Main Recursive Codegen Router ---
//
// Inspects a Figma node and dispatches to the appropriate component handler.
// New component types can be added by importing their handler and adding a
// case to the routing logic below.

import type { SAILNodeResult } from './types'
import { generateButtonSAIL } from './components/Button'
import { generateRichTextSAIL } from './components/RichText'
import { generateFrameSAIL } from './components/Frame'
import { generateButtonArrayLayout } from './templates'

export async function generateSAILForNode(node: BaseNode): Promise<SAILNodeResult> {

  // --- Instance nodes (component instances like Button) ---
  if (node.type === 'INSTANCE') {
    const mainComponent = await node.getMainComponentAsync()
    if (
      mainComponent &&
      mainComponent.parent &&
      mainComponent.parent.type === 'COMPONENT_SET'
    ) {
      switch (mainComponent.parent.name) {
        case 'Button':
          return { type: 'button', code: await generateButtonSAIL(node) }
      }
    }
  }

  // --- Text nodes → Rich Text Display Field ---
  if (node.type === 'TEXT') {
    try {
      return generateRichTextSAIL(node as TextNode)
    } catch (_e) {
      // Last-resort fallback: inline minimal SAIL so text is never silently lost
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

  // --- Frame nodes → Card Layout / SideBySide / ButtonArray ---
  if (node.type === 'FRAME') {
    let contents: string[] = []
    let buttonAlign: string | undefined

    // AutoLayout alignment detection for buttonArrayLayout
    if (node.layoutMode && node.layoutMode !== 'NONE') {
      if (node.layoutMode === 'HORIZONTAL') {
        if (node.primaryAxisAlignItems === 'MAX') {
          buttonAlign = 'END'
        } else if (node.primaryAxisAlignItems === 'CENTER') {
          buttonAlign = 'CENTER'
        }
      }
      if (node.layoutMode === 'VERTICAL') {
        if (node.counterAxisAlignItems === 'MAX') {
          buttonAlign = 'END'
        } else if (node.counterAxisAlignItems === 'CENTER') {
          buttonAlign = 'CENTER'
        }
      }
    }

    // Iterate children, grouping consecutive buttons into buttonArrayLayouts
    if ('children' in node && Array.isArray(node.children)) {
      let buffer: string[] = []
      for (const child of node.children) {
        const childResult = await generateSAILForNode(child)
        if (childResult && typeof childResult === 'object' && childResult.type === 'button') {
          buffer.push(childResult.code)
        } else {
          if (buffer.length > 0) {
            contents.push(generateButtonArrayLayout(buffer, buttonAlign))
            buffer = []
          }
          if (childResult && typeof childResult === 'string' && childResult.trim()) {
            contents.push(childResult)
          }
        }
      }
      if (buffer.length > 0) {
        contents.push(generateButtonArrayLayout(buffer, buttonAlign))
      }
    }
    return await generateFrameSAIL(node, contents, generateSAILForNode)
  }

  // --- Unrecognized node ---
  return ''
}
