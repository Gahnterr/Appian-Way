
export async function hasThisBoundVariable(node: SceneNode, variableNameBeingLookedUp: string): Promise<boolean> {
    const fills = 'fills' in node ? node.fills : undefined
    if (fills === undefined || Array.isArray(fills) === false || fills.length === 0) return false

    const solidFills = fills.filter((fill): fill is SolidPaint => fill.type === 'SOLID')
    const lastFill = solidFills.length > 0 ? solidFills[solidFills.length - 1] : null

    if (lastFill !== null && lastFill.boundVariables?.color?.id) {
        const boundVariableId = lastFill.boundVariables.color.id
        const lookedUpVariable = await figma.variables.getVariableByIdAsync(boundVariableId)
        const boundVariableName = lookedUpVariable?.name
        return boundVariableName === variableNameBeingLookedUp
    } else return false
}

export function getLastFillFromNode(node: FrameNode | VectorNode | InstanceNode | RectangleNode | TextNode | null | undefined, includeOpacity: true): RGBA | undefined
export function getLastFillFromNode(node: FrameNode | VectorNode | InstanceNode | RectangleNode | TextNode | null | undefined, includeOpacity: false): RGB | undefined
export function getLastFillFromNode(node: FrameNode | VectorNode | InstanceNode | RectangleNode | TextNode | null | undefined, includeOpacity = true): RGBA | RGB | undefined {
    let resultingColor: RGB | RGBA = { r: 1, g: 1, b: 1, a: 0 }
    if (node === undefined || node === null || (Array.isArray(node.fills) && node.fills.length === 0)) return undefined
    if (node !== undefined && Array.isArray(node.fills) && node.fills.length > 0) {
        const solidFills = node.fills.filter((fill): fill is SolidPaint => fill.type === 'SOLID')
        const lastFill = solidFills.length > 0 ? solidFills[solidFills.length - 1] : null
        if (lastFill && lastFill.color) {
            const paintOpacity = typeof lastFill.opacity === 'number' ? lastFill.opacity : 1
            const nodeOpacity = typeof node.opacity === 'number' ? node.opacity : 1
            const effectiveOpacity = paintOpacity * nodeOpacity
            resultingColor = { r: lastFill.color.r, g: lastFill.color.g, b: lastFill.color.b, a: effectiveOpacity }
        }
    }

    if (!includeOpacity) {
        const removedOpacity = { r: resultingColor.r, g: resultingColor.g, b: resultingColor.b }
        return removedOpacity as RGB
    }

    return resultingColor as RGBA
}

export const getLastStrokeFromNode = (node?: FrameNode | InstanceNode | RectangleNode | LineNode | TextNode | SlotNode | VectorNode): RGBA | undefined => {
    if (node !== undefined && Array.isArray(node.strokes) && node.strokes.length > 0) {
        const strokes = node.strokes.filter((stroke): stroke is SolidPaint => stroke.type === 'SOLID')
        const lastStroke = strokes.length > 0 ? strokes[strokes.length - 1] : null
        if (lastStroke && lastStroke.color) {
            const paintOpacity = typeof lastStroke.opacity === 'number' ? lastStroke.opacity : 1
            const nodeOpacity = typeof node.opacity === 'number' ? node.opacity : 1
            const effectiveOpacity = paintOpacity * nodeOpacity
            return { r: lastStroke.color.r, g: lastStroke.color.g, b: lastStroke.color.b, a: effectiveOpacity }
        }
    }

    return undefined
}