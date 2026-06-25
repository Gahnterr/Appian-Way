import { getMainComponentName } from "../../Utilities/getMainComponentName"
import { indentStringArray } from "../../Utilities/indent"
import { toHexColor } from "../../Utilities/rgbColorToHexColor"
import { SAILTextStyle, SAILTextSize, SAILRichTextColor, SAILLabelPosition, SAILTextAlign, SAILMargin, SAILRichTextIconSize, mapToSAILRichTextIconSize, SAILIcon, isSAILIcon, mapToSAILRichTextColor, mapToSAILTextAlign, mapToSAILMargin, mapToSAILTextSize } from "../SAILParameters"

type RichTextItemProps = {
    text: string
    style?: SAILTextStyle[]
    size?: SAILTextSize
    color?: SAILRichTextColor
}
declare const richTextItemBrand: unique symbol
type RichTextItem = string[] & { readonly [richTextItemBrand]: true }
const RichTextItem = ({
    text,
    style,
    size,
    color,
}: RichTextItemProps): RichTextItem => {
    const code: string[] = []

    code.push(`a!richTextItem(`)
    code.push(`  text: "${text}",`)
    if (style) code.push(`  style: { ${style.map(styleItem => `"${styleItem}"`).join(', ')} },`)
    if (size) code.push(`  size: "${size}",`)
    if (color) code.push(`  color: "${color}",`)
    code.push(`),`)

    return code as RichTextItem
}

const Char = (number: number): RichTextItem => {
    return [`char(${number}),`] as RichTextItem
}

type RichTextDisplayField = {
    label?: string
    labelPosition?: SAILLabelPosition
    instructions?: string
    align?: SAILTextAlign
    value: (RichTextItem | RichTextIcon)[]
    helpTooltip?: string
    preventWrapping?: boolean
    tooltip?: string
    marginAbove?: SAILMargin
    marginBelow?: SAILMargin
}
const RichTextDisplayField = ({
    label,
    labelPosition = 'COLLAPSED',
    instructions,
    align = 'LEFT',
    value,
    helpTooltip,
    preventWrapping = false,
    tooltip,
    marginAbove = 'NONE',
    marginBelow = 'NONE',
}: RichTextDisplayField): string[] => {
    const code: string[] = []

    code.push(`a!richTextDisplayField(`)
    if (label) code.push(`  label: "${label}",`)
    code.push(`  labelPosition: "${labelPosition}",`)
    if (instructions) code.push(`  instructions: "${instructions}",`)
    code.push(`  align: "${align}",`)
    code.push(`  value: {`)
    for (const richTextItem of value) { code.push(...indentStringArray(richTextItem, 2)) }
    code.push(`  },`)
    if (helpTooltip) code.push(`  helpTooltip: "${helpTooltip}",`)
    code.push(`  preventWrapping: ${preventWrapping},`)
    if (tooltip) code.push(`  tooltip: "${tooltip}",`)
    code.push(`  marginAbove: "${marginAbove}",`)
    code.push(`  marginBelow: "${marginBelow}",`)
    code.push(`),`)

    return code
}
type RichTextIconProps = {
    icon: string
    color?: SAILRichTextColor
    size?: SAILRichTextIconSize
}
declare const richTextIconBrand: unique symbol
type RichTextIcon = string[] & { readonly [richTextIconBrand]: true }
const RichTextIcon = ({ icon, color, size }: RichTextIconProps): RichTextIcon => {
    const code: string[] = []

    code.push(`a!richTextIcon(`)
    code.push(`  icon: "${icon}",`)
    if (color) code.push(`  color: "${color}",`)
    if (size) code.push(`  size: "${size}",`)
    code.push(`),`)

    return code as RichTextIcon
}
const generateRichTextIcon = async (instanceNode: InstanceNode): Promise<RichTextIcon> => {
    const icon = await getMainComponentName(instanceNode) ?? instanceNode.name
    const size = mapToSAILRichTextIconSize(instanceNode.width)

    const hasSolidFill = (node: SceneNode): boolean =>
        'fills' in node && Array.isArray(node.fills) && node.fills.some(fill => fill.type === 'SOLID')
    const colorBearingNode: SceneNode | null = hasSolidFill(instanceNode)
        ? instanceNode
        : instanceNode.findOne(hasSolidFill)
    let color: SAILRichTextColor = 'STANDARD'
    if (colorBearingNode && 'fills' in colorBearingNode && Array.isArray(colorBearingNode.fills)) {
        const solidFill = colorBearingNode.fills.find((fill): fill is SolidPaint => fill.type === 'SOLID')
        if (solidFill) color = toHexColor(solidFill.color.r, solidFill.color.g, solidFill.color.b)
    }

    return RichTextIcon({ icon, color, size })
}

export const generateSingleRichTextIcon = async (instanceNode: InstanceNode): Promise<string[]> => {
    const code: string[] = []
    const icon: SAILIcon = isSAILIcon(instanceNode.name) ? instanceNode.name : 'star'
    const color: SAILRichTextColor = mapToSAILRichTextColor(instanceNode)
    const size: SAILRichTextIconSize = mapToSAILRichTextIconSize(Math.max(instanceNode.width, instanceNode.height))
    const richTextIcon: RichTextIcon[] = [RichTextIcon({icon, color, size})]

    code.push(...RichTextDisplayField({
        value: richTextIcon
    }))
    return code
}

export const generateRichTextDisplayField = async (node: TextNode | FrameNode): Promise<string[]> => {
    const children: readonly SceneNode[] = node.type === 'TEXT' ? [node] : node.children
    const richTextValues: (RichTextItem | RichTextIcon)[] = []
    let align: SAILTextAlign = 'LEFT'
    let alignResolved = false
    let preventWrapping = false
    let marginAbove: SAILMargin = 'NONE'
    let marginBelow: SAILMargin = 'NONE'
    if (node.type === 'FRAME') {
        marginAbove = mapToSAILMargin(node.paddingTop)
        marginBelow = mapToSAILMargin(node.itemSpacing)
    }
    const addHorizontalSpace = () => {
        if (node.type === 'FRAME') {
            const space = ' '
            const spacer = RichTextItem({ text: space.repeat(node.itemSpacing) })
            if (node.type === 'FRAME') {
                richTextValues.push(spacer)
            }
        }
    }
    
    // Handle each child in Frame Node
    for (const [index, child] of children.entries()) {
        if (child.type === 'TEXT') {
            if (!alignResolved) {
                align = mapToSAILTextAlign(child.textAlignHorizontal)
                alignResolved = true
            }
            preventWrapping = child.textTruncation === 'ENDING'

            generateTextFromTextNode(child)
            if (index < children.length - 1) richTextValues.push(Char(10))
        } else if (child.type === 'INSTANCE') {
            richTextValues.push(await generateRichTextIcon(child))
        } else if (child.type === 'FRAME') {
            const firstChild = child.children[0]
            if (child.children.length === 1 && firstChild.type === 'INSTANCE' && await isRichTextIcon(firstChild)) {
                richTextValues.push(await generateRichTextIcon(firstChild))
                addHorizontalSpace()
            }
        }
    }

    function generateTextFromTextNode(childNode: TextNode) {
        const styledTextSegments = childNode.getStyledTextSegments(['fontStyle', 'fontWeight', 'textDecoration', 'fills', 'fontSize'])
        for (const textSegment of styledTextSegments) {
            const { characters, fontStyle, fontWeight, textDecoration, fills, fontSize } = textSegment
            const textLines = characters.split('\n')
            const size: SAILTextSize = mapToSAILTextSize(fontSize)

            const styles: SAILTextStyle[] = []
            if (fontStyle === 'ITALIC') styles.push('EMPHASIS')
            if (fontWeight >= 0 && fontWeight <= 400) styles.push('PLAIN')
            else if (fontWeight > 400) styles.push('STRONG')
            switch (textDecoration) {
                case 'NONE': break
                case 'UNDERLINE': styles.push('UNDERLINE'); break
                case 'STRIKETHROUGH': styles.push('STRIKETHROUGH'); break
                default: break
            }

            const fill = fills[fills.length - 1]
            const color = fills && fill.type === 'SOLID'
                ? toHexColor(fill.color.r, fill.color.g, fill.color.b)
                : '#000000'

            for (const [index, textLine] of textLines.entries()) {
                if (textLine) richTextValues.push(RichTextItem({ text: textLine, style: styles, color: color, size: size }))
                if (index < textLines.length - 1) richTextValues.push(Char(10))
            }
        }
    }

    return RichTextDisplayField({
        align: align,
        preventWrapping: preventWrapping,
        value: richTextValues,
        marginAbove,
        marginBelow
    })
}

export const isRichTextIcon = async (node: SceneNode): Promise<boolean> => {
    if (node.type === 'FRAME') {
        const firstChild = node.children[0]
        return node.children.length === 1 && isRichTextIcon(firstChild)
    }
    if (node.type !== 'INSTANCE') return false
    const mainComponentName = await getMainComponentName(node)
    return mainComponentName !== null && isSAILIcon(mainComponentName)
}

export const isRichTextDisplayFieldFrame = async (frameNode: FrameNode): Promise<boolean> => {
    if (Array.isArray(frameNode.fills) && frameNode.fills.length !== 0) return false
    if (Array.isArray(frameNode.strokes) && frameNode.strokes.length !== 0) return false
    if (frameNode.paddingLeft > 0 || frameNode.paddingRight > 0) return false

    const validChildrenComponents = await Promise.all(
        frameNode.children.map(async child => {
            if (child.type === 'TEXT') return true
            if (child.type === 'INSTANCE') return await isRichTextIcon(child)
            if (child.type === 'FRAME') return await isRichTextDisplayFieldFrame(child)
            return false
        })
    )

    return validChildrenComponents.every(Boolean)
}