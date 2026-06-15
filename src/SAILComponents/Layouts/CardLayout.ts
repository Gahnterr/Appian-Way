import { getAppliedModes } from "../../Utilities/getAppliedModes"
import { getMainComponentName } from "../../Utilities/getMainComponentName"
import { indentStringArray } from "../../Utilities/indent"
import { SAILCardHeight, SAILCardStyle, SAILMargin, SAILPadding, SAILCardShape, SAILCardDecorativeBarPosition, SAILCardDecorativeBarColor, mapToSAILCardHeight, mapToSAILCardStyle, mapToSAILMargin, mapToSAILPadding, mapToSAILCardDecorativeBarColor, mapToSAILCardDecorativeBarPosition, mapToSAILCardShape } from "../SAILParameters"

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
    let height: SAILCardHeight | undefined
    let lastFill: string = 'Transparent'
    let style: SAILCardStyle | undefined
    let showBorder: boolean = false
    let showShadow: boolean = false
    let shape: SAILCardShape | undefined
    let marginAbove: SAILMargin | undefined
    let marginBelow: SAILMargin | undefined
    let padding: SAILPadding | undefined
    let decorativeBarColor: SAILCardDecorativeBarColor | undefined
    let decorativeBarPosition: SAILCardDecorativeBarPosition | undefined

    switch (node.type) {
        case 'INSTANCE': {
            const appliedModes = await getAppliedModes(node)
            height = mapToSAILCardHeight(appliedModes['Height'])
            style = mapToSAILCardStyle(appliedModes['Card Style'])
            showBorder = appliedModes['Show Border'] === 'Yes'
            showShadow = appliedModes['Show Shadow'] === 'Yes'
            marginAbove = mapToSAILMargin(appliedModes['Margin Above'])
            marginBelow = mapToSAILMargin(appliedModes['Margin Below'])
            padding = mapToSAILPadding(appliedModes['Padding'])
            decorativeBarColor = mapToSAILCardDecorativeBarColor(appliedModes['Decorative Bar Color'])
            decorativeBarPosition = mapToSAILCardDecorativeBarPosition(appliedModes['Decorative Bar Position'])
            shape = mapToSAILCardShape(appliedModes['Shape'])
        }; break
        case 'FRAME': {
            height = node.layoutSizingVertical === 'HUG' ? 'AUTO' : mapToSAILCardHeight(node.height)
            if (Array.isArray(node.fills) && node.fills.length > 0) lastFill = node.fills[node.fills.length - 1]
            style = mapToSAILCardStyle(lastFill)
            showBorder = node.strokes.length > 0 ? true : false
            showShadow = node.effects.some(effect => effect.type === 'DROP_SHADOW' && effect.visible && effect.radius > 0) ? true : false
            marginAbove = 'NONE'
            marginBelow = 'NONE'
            padding = mapToSAILPadding(node.paddingTop, node.paddingBottom, node.paddingLeft, node.paddingRight)
            if (node.cornerRadius !== figma.mixed) {
                shape = mapToSAILCardShape(node.cornerRadius)
            } else {
                shape = mapToSAILCardShape(Math.max(node.topLeftRadius, node.topRightRadius, node.bottomLeftRadius, node.bottomRightRadius))
            }
        }; break
        default: break
    }

    return CardLayout({
        contents,
        height,
        style,
        showBorder,
        showShadow,
        marginBelow,
        marginAbove,
        padding,
        shape,
        decorativeBarColor,
        decorativeBarPosition,
    })
}

export const isCardLayoutFrame = async (node: FrameNode | InstanceNode): Promise<boolean> => {
    if (node.type === 'FRAME' && (node.fills || node.strokes)) return true
    if (node.type === 'INSTANCE') return await getMainComponentName(node) === 'Card Layout'
    if (node.layoutMode === 'VERTICAL' || (node.fills && node.strokes)) return true
    return false
}