import { stringProp } from "../../typeguards"
import { getAppliedModes } from "../../Utilities/getAppliedModes"
import { getComponentProps } from "../../Utilities/getComponentProps"
import { getMainComponentName } from "../../Utilities/getMainComponentName"
import { mapToSAILMargin, SAILMargin } from "../SAILParameters"

type HorizontalLineProps = {
    color?: 'SECONDARY' | 'STANDARD' | 'ACCENT' | string
    weight?: 'THIN' | 'MEDIUM' | 'THICK'
    marginAbove?: SAILMargin
    marginBelow?: SAILMargin
    style: 'SOLID' | 'DOT' | 'DASH'
}

const HorizontalLine = ({ color, weight, marginAbove, marginBelow, style }:HorizontalLineProps): string[] => {
    const code: string[] = []

    code.push(`a!horizontalLine(`)
    code.push(`  color: "${color}",`)
    code.push(`  weight: "${weight}",`)
    code.push(`  marginAbove: "${marginAbove}",`)
    code.push(`  marginBelow: "${marginBelow}",`)
    code.push(`  style: "${style}"`)
    code.push(`),`)

    return code
}

export const generateHorizontalLine = async (instanceNode: InstanceNode): Promise<string[]> => {
    const modes = await getAppliedModes(instanceNode)
    const props = getComponentProps(instanceNode)

    return HorizontalLine({
        color: 'SECONDARY',
        weight: 'THIN',
        marginAbove: mapToSAILMargin(modes['Margin Above']),
        marginBelow: mapToSAILMargin(modes['Margin Below']),
        style: 'SOLID'
    })
}

export const isHorizontalLineInstance = async (node: SceneNode): Promise<boolean> => {
    if (node.type === 'INSTANCE') return await getMainComponentName(node) === 'Horizontal Line'
    return false
}