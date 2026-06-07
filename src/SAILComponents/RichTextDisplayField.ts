import { getMainComponentName } from "../getMainComponentName"
import { indentStringArray } from "../indent"
import { mapToSAILRichTextIconSize, mapToSAILTextAlignHorizontal, SAILLabelPosition, SAILRichTextIconSize, SAILTextAlign, SAILMargin, SAILTextStyle, SAILTextSize, SAILTextColor } from "./SAILParameters"
import { rgbColorToHexColor } from "./../rgbColorToHexColor"

type RichTextItemProps = {
    text: string
    style?: SAILTextStyle[]
    size?: SAILTextSize
    color?: SAILTextColor
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
    value: RichTextItem[]
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
    color?: SAILTextColor
    size?: SAILRichTextIconSize
}
const RichTextIcon = ({ icon, color, size }: RichTextIconProps): RichTextItem => {
    const code: string[] = []

    code.push(`a!richTextIcon(`)
    code.push(`  icon: "${icon}",`)
    if (color) code.push(`  color: "${color}",`)
    if (size) code.push(`  size: "${size}",`)
    code.push(`),`)

    return code as RichTextItem
}
const generateRichTextIcon = async (instanceNode: InstanceNode): Promise<RichTextItem> => {
    const icon = await getMainComponentName(instanceNode, 'COMPONENT') ?? instanceNode.name
    const size = mapToSAILRichTextIconSize(instanceNode.width)

    const hasSolidFill = (node: SceneNode): boolean =>
        'fills' in node && Array.isArray(node.fills) && node.fills.some(fill => fill.type === 'SOLID')
    const colorBearingNode: SceneNode | null = hasSolidFill(instanceNode)
        ? instanceNode
        : instanceNode.findOne(hasSolidFill)
    let color: SAILTextColor = 'STANDARD'
    if (colorBearingNode && 'fills' in colorBearingNode && Array.isArray(colorBearingNode.fills)) {
        const solidFill = colorBearingNode.fills.find((fill): fill is SolidPaint => fill.type === 'SOLID')
        if (solidFill) color = rgbColorToHexColor(solidFill.color.r, solidFill.color.g, solidFill.color.b)
    }

    return RichTextIcon({ icon, color, size })
}

export const generateRichTextDisplayField = async (node: TextNode | FrameNode): Promise<string[]> => {
    const childNodes: readonly SceneNode[] = node.type === 'TEXT' ? [node] : node.children
    const richTextItems: RichTextItem[] = []
    let align: SAILTextAlign = 'LEFT'
    let alignResolved = false
    let preventWrapping = false

    for (const childNode of childNodes) {
        if (childNode.type === 'TEXT') {
            if (!alignResolved) {
                align = mapToSAILTextAlignHorizontal(childNode.textAlignHorizontal)
                alignResolved = true
            }
            if (childNode.textTruncation === 'ENDING') preventWrapping = true

            const styledTextSegments = childNode.getStyledTextSegments(['fontStyle', 'fontWeight', 'textDecoration', 'fills'])
            for (const textSegment of styledTextSegments) {
                const { characters, fontStyle, fontWeight, textDecoration, fills } = textSegment
                const textLines = characters.split('\n')

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
                    ? rgbColorToHexColor(fill.color.r, fill.color.g, fill.color.b)
                    : '#000000'

                for (const [index, textLine] of textLines.entries()) {
                    if (textLine) richTextItems.push(RichTextItem({ text: textLine, style: styles, color: color }))
                    if (index < textLines.length - 1) richTextItems.push(Char(10))
                }
            }
        } else if (childNode.type === 'INSTANCE') {
            richTextItems.push(await generateRichTextIcon(childNode))
        }
    }

    return RichTextDisplayField({
        label: node.name,
        align: align,
        preventWrapping: preventWrapping,
        value: richTextItems,
    })
}

