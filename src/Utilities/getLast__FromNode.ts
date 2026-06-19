export const getLastFillFromNode = (node?: FrameNode | InstanceNode | RectangleNode): RGBA => {
    if (node !== undefined && Array.isArray(node.fills) && node.fills.length > 0) {
        const solidFills = node.fills.filter((fill): fill is SolidPaint => fill.type === 'SOLID')
        const lastFill = solidFills.length > 0 ? solidFills[solidFills.length - 1] : null
        if (lastFill && lastFill.color) {
            const lastOpacity = typeof node.opacity === 'number' ? node.opacity : 1
            return { r: lastFill.color.r, g: lastFill.color.g, b: lastFill.color.b, a: lastOpacity }
        }
    }

    return { r: 1, g: 0, b: 1, a: 1 }
}

export const getLastStrokeFromNode = (node?: FrameNode | InstanceNode | RectangleNode | LineNode): RGBA => {
    if (node !== undefined && Array.isArray(node.strokes) && node.strokes.length > 0) {
        const strokes = node.strokes.filter((stroke): stroke is SolidPaint => stroke.type === 'SOLID')
        const lastStroke = strokes.length > 0 ? strokes[strokes.length - 1] : null
        if (lastStroke && lastStroke.color) {
            const lastOpacity = typeof node.opacity === 'number' ? node.opacity : 1
            return { r: lastStroke.color.r, g: lastStroke.color.g, b: lastStroke.color.b, a: lastOpacity }
        }
    }

    return { r: 1, g: 0, b: 1, a: 1 }
}