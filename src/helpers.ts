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

/** Check whether a generated SAIL string is a cardLayout call */
export function isCardLayoutCode(code: string): boolean {
  return /^\s*a!cardLayout\s*\(/.test(code)
}
