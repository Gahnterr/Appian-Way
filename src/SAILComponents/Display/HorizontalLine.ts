import { isLineNode, stringProp } from "../../typeguards"
import { getAppliedModes } from "../../Utilities/getAppliedModes"
import { getComponentProps } from "../../Utilities/getComponentProps"
import { getLastFillFromNode, getLastStrokeFromNode } from "../../Utilities/getLast__FromNode"
import { getMainComponentName } from "../../Utilities/getMainComponentName"
import { RGBAToHexColor, toHexColor } from "../../Utilities/rgbColorToHexColor"
import { mapToSAILMargin, SAILMargin } from "../SAILParameters"

type SAILHorizontalLineColor = 'SECONDARY' | 'STANDARD' | 'ACCENT' | string
const mapToSAILHorizontalLineColor = (instanceNode: InstanceNode): SAILHorizontalLineColor => {
    const lineNode = instanceNode.findChild(child => child.type === 'LINE')
    let strokeColor: string
    if (lineNode && isLineNode(lineNode)) {
        strokeColor = RGBAToHexColor(getLastStrokeFromNode(lineNode))
        switch (strokeColor) {
            case '#D4D4D4': return 'SECONDARY'
            case '#222222': return 'STANDARD'
            case '#A3239E': return 'ACCENT'
            default: break
        }
    }
    return strokeColor = '#FF00FF'
}

type SAILHorizontalWeight = 'THIN' | 'MEDIUM' | 'THICK'
const mapToSAILHorizontalWeight = (weight: string, instanceNode?: InstanceNode): SAILHorizontalWeight => {
    switch (weight) {
        case 'Thin': return 'THIN'
        case 'Medium': return 'MEDIUM'
        case 'Thick': return 'THICK'
        default: break
    }
    if (instanceNode !== undefined) {
        const lineNode = instanceNode.findChild(child => child.type === 'LINE')
        if (lineNode && isLineNode(lineNode)) {
            const strokeWeight = lineNode.strokeWeight !== figma.mixed ? lineNode.strokeWeight : 0
            if (strokeWeight < 0) return 'THIN'
            else if (strokeWeight <= 3) return 'MEDIUM'
            else return 'THICK'
        }
    }
    return 'THIN'
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

const HorizontalLine = ({ color, weight, marginAbove, marginBelow, style }:HorizontalLineProps): string[] => {
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

export const generateHorizontalLine = async (instanceNode: InstanceNode): Promise<string[]> => {
    const modes = await getAppliedModes(instanceNode)
    const props = getComponentProps(instanceNode)

    return HorizontalLine({
        color: mapToSAILHorizontalLineColor(instanceNode),
        weight: mapToSAILHorizontalWeight(stringProp(props['Weight'].value), instanceNode),
        marginAbove: mapToSAILMargin(modes['Margin Above']),
        marginBelow: mapToSAILMargin(modes['Margin Below']),
        style: mapToSAILHorizontalLineStyle(stringProp(props['Style'].value))
    })
}

export const isHorizontalLineInstance = async (node: SceneNode): Promise<boolean> => {
    if (node.type === 'INSTANCE') return await getMainComponentName(node) === 'Horizontal Line'
    return false
}