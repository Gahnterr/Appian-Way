import { getAppliedModes } from "../getAppliedModes"
import { indentStringArray } from "../indent"
import { mapToSAILCardDecorativeBarColor, mapToSAILCardDecorativeBarPosition, mapToSAILCardHeight, mapToSAILCardStyle, mapToSAILMargin, mapToSAILPadding, SAILCardDecorativeBarColor, SAILCardDecorativeBarPosition, SAILCardHeight, SAILCardShape, SAILCardStyle, SAILMargin, SAILPadding } from "./SAILParameters"

type CardLayout = {
    contents: string[]
    height?: SAILCardHeight
    style?: SAILCardStyle
    showBorder?: boolean
    showShadow?: boolean
    marginBelow?: SAILMargin
    marginAbove?: SAILMargin
    padding?: SAILPadding
    shape?: SAILCardShape
    decorativeBarPosition?: SAILCardDecorativeBarPosition
    decorativeBarColor?: SAILCardDecorativeBarColor
}

const CardLayout = ({
    contents,
    height,
    style,
    showBorder,
    showShadow,
    marginBelow,
    marginAbove,
    padding,
    shape,
    decorativeBarPosition,
    decorativeBarColor,
}: CardLayout): string[] => {
    const code: string[] = []

    code.push(`a!cardLayout(`)
    code.push(`  contents: {`)
    code.push(...indentStringArray(contents, 2))
    code.push(`  },`)
    code.push(`  height: "${height ?? 'AUTO'}",`)
    code.push(`  style: "${style ?? 'TRANSPARENT'}",`)
    code.push(`  showBorder: ${showBorder ?? false},`)
    code.push(`  showShadow: ${showShadow ?? false},`)
    code.push(`  marginBelow: "${marginBelow ?? 'STANDARD'}",`)
    if (marginAbove) code.push(`  marginAbove: "${marginAbove}",`)
    code.push(`  padding: "${padding ?? 'LESS'}",`)
    code.push(`  shape: "${shape ?? 'ROUNDED'}",`)
    if (decorativeBarColor) code.push(`  decorativeBarColor: "${decorativeBarColor}",`)
    if (decorativeBarPosition) code.push(`  decorativeBarPosition: "${decorativeBarPosition}",`)
    code.push(`),`)
    return code
}

export const generateCardLayout = async (node: FrameNode | InstanceNode, contents: string[]): Promise<string[]> => {
    const appliedModes = await getAppliedModes(node)
    const lastFill = node.type === 'FRAME' && Array.isArray(node.fills) && node.fills.length > 0
        ? node.fills[node.fills.length - 1]
        : 'Transparent'
    const height: SAILCardHeight = mapToSAILCardHeight(node.type === 'INSTANCE' ? (appliedModes['Height'] ?? 'Auto') : node.height)
    const style: SAILCardStyle = mapToSAILCardStyle(node.type === 'INSTANCE' ? (appliedModes['Card Style'] ?? 'Transparent') : lastFill)
    const showBorder = appliedModes['Show Border'] === 'Yes'
    const showShadow = appliedModes['Show Shadow'] === 'Yes'
    const marginBelow: SAILMargin = mapToSAILMargin(appliedModes['Margin Below'] ?? 'Standard')
    const marginAbove: SAILMargin = mapToSAILMargin(appliedModes['Margin Above'] ?? 'Standard')
    const padding: SAILPadding = mapToSAILPadding(appliedModes['Padding'] ?? 'Less')
    const decorativeBarColor: SAILCardDecorativeBarColor = mapToSAILCardDecorativeBarColor(appliedModes['Decorative Bar Color'] ?? '')
    const decorativeBarPosition: SAILCardDecorativeBarPosition = mapToSAILCardDecorativeBarPosition(appliedModes['Decorative Bar Position'] ?? '')

    return CardLayout({
        contents,
        height,
        style,
        showBorder,
        showShadow,
        marginBelow,
        marginAbove,
        padding,
        decorativeBarColor,
        decorativeBarPosition,
    })
}