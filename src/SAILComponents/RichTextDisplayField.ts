import { indentStringArray } from "../indent"
import { mapToSAILTextAlignHorizontal, SAILLabelPosition, SAILTextAlign, SAILMargin, SAILTextStyle, SAILTextSize, SAILTextColor } from "./SAILParameters"
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
export const generateRichTextDisplayField = (textNode: TextNode): string[] => {
    const preventWrapping = textNode.textTruncation === 'ENDING' ? true : false
    const styledTextSegments = textNode.getStyledTextSegments(['fontStyle', 'fontWeight', 'textDecoration', 'fills'])
    const richTextItems: RichTextItem[] = styledTextSegments.flatMap(textSegment => {
        const { characters, fontStyle, fontWeight, textDecoration, fills } = textSegment
        const textLines = characters.split('\n')
        const dividedRichTextItems: RichTextItem[] = []

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
            if (textLine) dividedRichTextItems.push(RichTextItem({ text: textLine, style: styles, color: color }))
            if (index < textLines.length - 1) dividedRichTextItems.push(Char(10))
        }

        return dividedRichTextItems
    })

    return RichTextDisplayField({
        label: textNode.name,
        align: mapToSAILTextAlignHorizontal(textNode.textAlignHorizontal),
        preventWrapping: preventWrapping,
        value: richTextItems,
    })
}

