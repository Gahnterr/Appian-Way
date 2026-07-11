import { stringProp } from "../../typeguards"
import { getAppliedModes } from "../../Utilities/getAppliedModes"
import { getComponentProps } from "../../Utilities/getComponentProps"
import { getComponentSlot, getTagItemsFromSlot } from "../../Utilities/getComponentSlots"
import { getLastFillFromNode, hasThisBoundVariable } from "../../Utilities/getLast__FromNode"
import { getMainComponentName } from "../../Utilities/getMainComponentName"
import { indentStringArray } from "../../Utilities/indent"
import { RGBAToHexColor, RGBToHexColor } from "../../Utilities/rgbColorToHexColor"
import { mapToSAILMargin, SAILLabelPosition, SAILMargin } from "../SAILParameters"

type SAILTagBackgroundColor = 'ACCENT' | 'POSITIVE' | 'NEGATIVE' | 'WARN' | 'SECONDARY' | string
const mapToSAILTagBackgroundColor = (figmaBGColor: string | RGBA) => {
    switch (figmaBGColor) {
        case 'Accent': return 'ACCENT'
        case 'Positive': return 'POSTIIVE'
        case 'Negative': return 'NEGATIVE'
        case 'Secondary': return 'SECONDARY'
        default: break
    }
    if (typeof figmaBGColor !== 'string') {
        return RGBAToHexColor(figmaBGColor)
    }
    return 'ACCENT'
}

type TagItem = {
    text?: string
    backgroundColor?: SAILTagBackgroundColor
    textColor?: 'STANDARD' | string
    tooltip?: string
}
const TagItem = ({
    text, backgroundColor, textColor, tooltip
}: TagItem): string[] => {
    const code: string[] = []

    code.push(`a!tagItem(`)
    if (text) code.push(`  text: "${text}",`)
    if (backgroundColor) code.push(`  backgroundColor: "${backgroundColor}",`)
    if (textColor) code.push(`  textColor: "${textColor}",`)
    if (tooltip) code.push(`  tooltip: "${tooltip}"`)
    code.push(`),`)

    return code
}

export const generateTagItem = async (instanceNode: InstanceNode): Promise<string[]> => {
    const props = getComponentProps(instanceNode)
    const modes = await getAppliedModes(instanceNode)
    let backgroundColor: SAILTagBackgroundColor | undefined
    let textColor = 'STANDARD'

    const tagTextNode = instanceNode.findChild(child => child.type === 'TEXT') as TextNode | null
    if (tagTextNode !== null && tagTextNode.fills !== undefined) {
        if (await hasThisBoundVariable(tagTextNode, 'Tag Standard Text Color')) textColor = 'STANDARD'
        else {
            const lastTextFill = getLastFillFromNode(tagTextNode, false)
            if (lastTextFill !== undefined) textColor = RGBToHexColor(lastTextFill)
        }
    } 

    if (modes['Tag BG Color'] !== undefined) backgroundColor = mapToSAILTagBackgroundColor(modes['Tag BG Color'])
    else {
        const lastFill = getLastFillFromNode(instanceNode, true)
        if (lastFill !== undefined) backgroundColor = mapToSAILTagBackgroundColor(lastFill)
    }

    return TagItem({
        text: stringProp(props['Text']?.value),
        backgroundColor,
        textColor,
        tooltip: props['Show Tooltip']?.value === true ? stringProp(props['Tooltip/Label']?.value) : undefined
    })
}

type SAILTagAlign = 'START' | 'CENTER' | 'END'

type SAILTagSize = 'SMALL' | 'STANDARD'
const mapToSAILTagSize = (figmaTagSize: string): SAILTagSize => {
    switch (figmaTagSize) {
        case 'Standard': return 'STANDARD'
        case 'Small': return 'SMALL'
        default: return 'STANDARD'
    }
}

type TagField = {
    label?: string
    labelPosition?: SAILLabelPosition
    instructions?: string
    helpTooltip?: string
    tags: string[][]
    align?: SAILTagAlign
    size?: SAILTagSize
    marginAbove?: SAILMargin
    marginBelow?: SAILMargin
}

const TagField = ({
    label, labelPosition = 'COLLAPSED', instructions, helpTooltip, tags, align, size, marginAbove, marginBelow
}: TagField): string[] => {
    const code: string[] = []

    code.push(`a!tagField(`)
    if (label) code.push(`  label: "${label}",`)
    if (labelPosition) code.push(`  labelPosition: "${labelPosition}",`)
    if (instructions) code.push(`  instructions: "${instructions}",`)
    if (helpTooltip) code.push(`  helpTooltip: "${helpTooltip}",`)
    code.push(`  tags: {`)
    for (const tag of tags) code.push(...indentStringArray(tag))
    code.push(`  },`)
    if (align) code.push(`  align: "${align}",`)
    if (size) code.push(`  size: "${size}",`)
    if (marginAbove) code.push(`  marginAbove: "${marginAbove}",`)
    if (marginBelow) code.push(`  marginBelow: "${marginBelow}",`)
    code.push(`),`)

    return code
}

export const generateTagField = async (instanceNode: InstanceNode): Promise<string[]> => {
    const tags: string[][] = []
    const tagsSlotNode = getComponentSlot(instanceNode, 'Tags')
    const modes = await getAppliedModes(instanceNode)

    if (tagsSlotNode !== undefined) {
        const tagItems = await getTagItemsFromSlot(tagsSlotNode)
        for (const tagItem of tagItems) {
            tags.push(indentStringArray(await generateTagItem(tagItem)))
        }
    }

    return TagField({
        tags,
        size: mapToSAILTagSize(modes['Tag Size']),
        marginAbove: mapToSAILMargin(modes['Margin Above']),
        marginBelow: mapToSAILMargin(modes['Margin Below'])
    })
}

export const isTagFieldInstance = async (instanceNode: InstanceNode): Promise<boolean> => {
    const instanceMainComponentName = await getMainComponentName(instanceNode)
    return instanceMainComponentName === 'Tag Field'
}