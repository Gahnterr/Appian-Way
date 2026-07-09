import { getAppliedModes } from "../../Utilities/getAppliedModes"
import { getHeaviestStroke } from "../../Utilities/getHeaviestStroke"
import { getLastFillFromNode, getLastStrokeFromNode } from "../../Utilities/getLast__FromNode"
import { getMainComponentName } from "../../Utilities/getMainComponentName"
import { indentStringArray } from "../../Utilities/indent"
import { strokesAreSameWeight } from "../../Utilities/strokesAreSameWeight"
import { SAILCardHeight, SAILCardStyle, SAILMargin, SAILPadding, SAILCardShape, SAILCardDecorativeBarPosition, SAILCardDecorativeBarColor, mapToSAILCardHeight, mapToSAILCardStyle, mapToSAILMargin, mapToSAILPadding, mapToSAILCardDecorativeBarColor, mapToSAILCardDecorativeBarPosition, mapToSAILCardShape, SAILCardBorderColor, mapToSAILCardBorderColor } from "../SAILParameters"
import { generateSideBySideLayout } from "./SideBySideLayout"

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
    borderColor?: SAILCardBorderColor
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
    borderColor
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
    if (borderColor) code.push (`   borderColor: "${borderColor}"`)
    code.push(`),`)
    return code
}

export const generateCardLayout = async (node: FrameNode | InstanceNode, contents: string[]): Promise<string[]> => {
    let height: SAILCardHeight | undefined
    let style: SAILCardStyle | undefined
    let showBorder: boolean = false
    let showShadow: boolean = false
    let shape: SAILCardShape | undefined
    let marginAbove: SAILMargin | undefined
    let marginBelow: SAILMargin | undefined
    let padding: SAILPadding | undefined
    let decorativeBarColor: SAILCardDecorativeBarColor | undefined
    let decorativeBarPosition: SAILCardDecorativeBarPosition | undefined
    let borderColor: SAILCardBorderColor | undefined

    switch (node.type) {
        case 'INSTANCE': {
            const modes = await getAppliedModes(node)
            if (modes['Card Style']) {
                style = mapToSAILCardStyle(modes['Card Style'])
            } else {                
                const cardNode = node.findChild(child => child.name === 'Card')
                const cardFrameNode = cardNode && cardNode.type === 'FRAME' ? cardNode : undefined
                const cardFrameLastFill = getLastFillFromNode(cardFrameNode, true)
                style = mapToSAILCardStyle(cardFrameLastFill)
            }
            height = mapToSAILCardHeight(modes['Height'])
            showBorder = modes['Show Border'] === 'Yes'
            showShadow = modes['Show Shadow'] === 'Yes'
            marginAbove = mapToSAILMargin(modes['Margin Above'])
            marginBelow = mapToSAILMargin(modes['Margin Below'])
            padding = mapToSAILPadding(modes['Padding'])
            decorativeBarColor = mapToSAILCardDecorativeBarColor(modes['Decorative Bar Color'])
            decorativeBarPosition = mapToSAILCardDecorativeBarPosition(modes['Decorative Bar Position'])
            shape = mapToSAILCardShape(modes['Shape'])
            borderColor = mapToSAILCardBorderColor(modes['Card Border Color'])
        }; break
        case 'FRAME': {
            const strokeWeights = { top: node.strokeTopWeight, right: node.strokeRightWeight, bottom: node.strokeBottomWeight, left: node.strokeLeftWeight }
            height = node.layoutSizingVertical === 'HUG' ? 'AUTO' : mapToSAILCardHeight(node.height)
            const lastFill = getLastFillFromNode(node, true)
            const lastStroke = getLastStrokeFromNode(node)
            style = lastFill ? mapToSAILCardStyle(lastFill) : undefined
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
            if (lastStroke !== undefined && strokesAreSameWeight(...Object.values(strokeWeights))) {
                borderColor = lastStroke !== undefined ? mapToSAILCardBorderColor(lastStroke) : undefined
            } else if (lastStroke !== undefined) {
                borderColor = undefined
                const heaviestStroke = getHeaviestStroke(strokeWeights)
                if (heaviestStroke.weight > 1) {
                    decorativeBarPosition = mapToSAILCardDecorativeBarPosition(heaviestStroke.position)
                    decorativeBarColor = mapToSAILCardDecorativeBarColor(lastStroke)
                }
            }
        }; break
        default: break
    }

    return CardLayout({ contents, height, style, showBorder, showShadow, marginBelow, marginAbove, padding, shape, decorativeBarColor, decorativeBarPosition, borderColor })
}
export const isCardLayoutNode = async (node: FrameNode | InstanceNode): Promise<boolean> => {
    if (node.type === 'INSTANCE') return await getMainComponentName(node) === 'Card Layout'

    if (node.type === 'FRAME') {
        if (Array.isArray(node.fills) && node.fills.length > 0) return true
        if (Array.isArray(node.strokes) && node.strokes.length > 0) return true
        if (node.paddingBottom > 0 || node.paddingTop > 0 || node.paddingLeft > 0|| node.paddingRight > 0) return true
        if (node.layoutMode === 'VERTICAL') return true
    }

    return false
}

export const generateCardWithHorizontalLayout = async (node: FrameNode, childrenCode: string[][]): Promise<string[]> => {
    const code: string[] = []
    const contents: string[] = []
    
    contents.push(...generateSideBySideLayout(node, childrenCode))

    code.push(...await generateCardLayout(node, contents))
    return code
}
export const isFrameWithChildrenInHorizontalLayout = (node: FrameNode): boolean => {
    return node.layoutMode === 'HORIZONTAL' 
        && Array.isArray(node.children) && node.children.length > 1
}