import { isLineNode, stringProp } from "../../typeguards"
import { getAppliedModes } from "../../Utilities/getAppliedModes"
import { getComponentProps } from "../../Utilities/getComponentProps"
import { getLastStrokeFromNode } from "../../Utilities/getLast__FromNode"
import { getMainComponentName } from "../../Utilities/getMainComponentName"
import { RGBToHexColor } from "../../Utilities/rgbColorToHexColor"
import { mapToSAILMargin, SAILMargin } from "../SAILParameters"

type SAILHorizontalLineColor = 'SECONDARY' | 'STANDARD' | 'ACCENT' | string
const mapToSAILHorizontalLineColor = (strokeColor: RGB | undefined): SAILHorizontalLineColor => {
    if (strokeColor === undefined) return 'STANDARD'
    const strokeColorHex = RGBToHexColor(strokeColor)
    switch (strokeColorHex) {
        case '#D4D4D4': return 'SECONDARY'
        case '#222222': return 'STANDARD'
        case '#A3239E': return 'ACCENT'
        default: break
    }

    return strokeColorHex
}

type SAILHorizontalWeight = 'THIN' | 'MEDIUM' | 'THICK'
const mapToSAILHorizontalWeight = (weightFromModes?: string, node?: InstanceNode | LineNode | VectorNode): SAILHorizontalWeight => {
    switch (weightFromModes) {
        case 'Thin': return 'THIN'
        case 'Medium': return 'MEDIUM'
        case 'Thick': return 'THICK'
        default: break
    }
    let strokeWeight: number = 0
    if (node !== undefined && node.type === 'INSTANCE') {
        const lineNode = node.findChild(child => child.type === 'LINE')
        if (lineNode && isLineNode(lineNode)) {
            if (lineNode.strokeWeight !== figma.mixed) strokeWeight = lineNode.strokeWeight
        }
    }
    if (node !== undefined && ((node.type === 'LINE' || node.type === 'VECTOR') && node.strokeWeight !== figma.mixed)) {
        strokeWeight = node.strokeWeight
    }
    if (strokeWeight <= 1) return 'THIN'
    else if (strokeWeight <= 3) return 'MEDIUM'
    else return 'THICK'
}

type SAILHorizontalLineStyle = 'SOLID' | 'DOT' | 'DASH'
const mapToSAILHorizontalLineStyle = (style: string): SAILHorizontalLineStyle => {
    switch (style) {
        case 'Solid': return 'SOLID'
        case 'Dash': return 'DASH'
        case 'Dot': return 'DOT'
        default: return 'SOLID'
    }
}


type HorizontalLineProps = {
    color?: SAILHorizontalLineColor
    weight?: SAILHorizontalWeight
    marginAbove?: SAILMargin
    marginBelow?: SAILMargin
    style: SAILHorizontalLineStyle
}

const HorizontalLine = ({ color, weight, marginAbove, marginBelow, style }: HorizontalLineProps): string[] => {
    const code: string[] = []

    code.push(`a!horizontalLine(`)
    if (color) code.push(`  color: "${color}",`)
    if (weight) code.push(`  weight: "${weight}",`)
    if (marginAbove) code.push(`  marginAbove: "${marginAbove}",`)
    if (marginBelow) code.push(`  marginBelow: "${marginBelow}",`)
    code.push(`  style: "${style}"`)
    code.push(`),`)

    return code
}

export const generateHorizontalLine = async (node: InstanceNode | LineNode | VectorNode): Promise<string[]> => {
    let lineStrokeColor: RGBA | undefined
    let weight
    let marginAbove: SAILMargin | undefined
    let marginBelow: SAILMargin | undefined
    let style: SAILHorizontalLineStyle = "SOLID"

    if (node.type === 'INSTANCE') {
        const modes = await getAppliedModes(node)
        const props = getComponentProps(node)
        const lineNode = node.children[0].type === 'LINE' ? node.children[0] : undefined
        lineStrokeColor = getLastStrokeFromNode(lineNode)
        weight = mapToSAILHorizontalWeight(stringProp(props['Weight'].value), node)

        marginAbove = mapToSAILMargin(modes['Margin Above'])
        marginBelow = mapToSAILMargin(modes['Margin Below'])
        style = mapToSAILHorizontalLineStyle(stringProp(props['Style'].value))
    } else if (node.type === 'LINE' || node.type === 'VECTOR') {
        lineStrokeColor = getLastStrokeFromNode(node)
        weight = mapToSAILHorizontalWeight('', node)
        marginAbove = 'NONE'
        marginBelow = 'NONE'
        if (node.dashPattern.length === 0) style = 'SOLID'
        else if (node.dashPattern.length >= 2 && node.dashPattern.every(number => number === 1)) style = 'DOT'
        else style = 'DASH'
    }

    return HorizontalLine({
        color: lineStrokeColor !== undefined ? mapToSAILHorizontalLineColor(lineStrokeColor) : undefined,
        weight,
        marginAbove,
        marginBelow,
        style
    })
}

export const isHorizontalLineInstance = async (node: SceneNode): Promise<boolean> => {
    if (node.type === 'INSTANCE') return await getMainComponentName(node) === 'Horizontal Line'
    return false
}