// --- Figma Node Analysis Helpers ---

/** Resolve the applied variable modes on an instance (e.g. button style, size, color) */
export async function getAppliedVariableModes(node: InstanceNode): Promise<Record<string, string>> {
  const result: Record<string, string> = {}
  const appliedModes = node.resolvedVariableModes || {}
  for (const collectionId in appliedModes) {
    const modeId = appliedModes[collectionId]
    const collection = await figma.variables.getVariableCollectionByIdAsync(collectionId)
    if (!collection) continue
    const collectionName = collection.name
    const mode = collection.modes.find(m => m.modeId === modeId)
    if (mode && collectionName) {
      result[collectionName] = mode.name
    }
  }
  return result
}

/** Extract component properties as a label → value map */
export function getComponentPropsMap(props: Record<string, any>): Record<string, string> {
  const result: Record<string, string> = {}
  for (const key in props) {
    // Use the visible label if available, else fallback to key
    const label = props[key].name || key
    result[label] = props[key].value?.toString?.() ?? ''
  }
  return result
}

/** Check whether a frame has a visible fill or stroke (i.e. would render as a card) */
export function isCardLayoutFrame(node: FrameNode): boolean {
  const hasFill = Array.isArray(node.fills) && node.fills.length > 0 && node.fills[0].type === 'SOLID' && node.fills[0].opacity !== 0
  const hasStroke = Array.isArray(node.strokes) && node.strokes.length > 0 && node.strokes[0].type === 'SOLID'
  return hasFill || hasStroke
}

/** Check whether a generated SAIL string is a sideBySideLayout call */
export function isSideBySideLayoutCode(code: string): boolean {
  return /^\s*a!sideBySideLayout\s*\(/.test(code)
}

/** Check whether a generated SAIL string is a columnsLayout call */
export function isColumnsLayoutCode(code: string): boolean {
  return /^\s*a!columnsLayout\s*\(/.test(code)
}

/** Check whether a generated SAIL string is a cardLayout call */
export function isCardLayoutCode(code: string): boolean {
  return /^\s*a!cardLayout\s*\(/.test(code)
}

/** 
 * Extract the Appian property name from a variable name like "Spacing/Side By Side Layout - Dense"
 * Returns simplified name like "DENSE" or null if not found
 */
export async function getVariableValueName(node: SceneNode, property: 'itemSpacing' | 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft'): Promise<string | null> {
  if (!('layoutMode' in node)) return null
  
  const boundVar = node.boundVariables?.[property]
  if (!boundVar) return null
  
  const varId = Array.isArray(boundVar) ? boundVar[0]?.id : (boundVar as any)?.id
  if (!varId) return null
  
  try {
    const variable = await figma.variables.getVariableByIdAsync(varId)
    if (!variable) return null
    
    // Extract from patterns like "Spacing/Side By Side Layout - Dense" → "DENSE"
    const parts = variable.name.split(' - ')
    if (parts.length > 1) {
      return parts[1].toUpperCase().replace(/\s+/g, '_')
    }
    
    // Or from "Spacing/Dense" → "DENSE"
    const slashParts = variable.name.split('/')
    if (slashParts.length > 1) {
      return slashParts[1].toUpperCase().replace(/\s+/g, '_')
    }
    
    return null
  } catch {
    return null
  }
}
