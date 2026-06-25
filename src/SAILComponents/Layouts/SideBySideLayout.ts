import { indentStringArray } from "../../Utilities/indent"
import { isButtonArrayFrame } from "../Action/ButtonArrayLayout"
import { mapToSAILMargin, mapToSAILSideBySideItemWidth, mapToSAILSideBySideLayoutAlignVertical, mapToSAILSideBySideLayoutItemSpacing, SAILMargin, SAILSideBySideItemWidth, SAILSideBySideLayoutAlignVertical, SAILSideBySideLayoutItemSpacing } from "../SAILParameters"
import { isStampFieldInstance } from "../Display/StampField"
import { isRichTextDisplayFieldFrame, isRichTextIcon } from "../Display/RichTextDisplayField"
import { isParagraphFieldInstance } from "../Inputs/ParagraphField"
import { isTextFieldInstance } from "../Inputs/TextField"
import { isDropdownFieldInstance } from "../Selection/DropdownField"
import { isBooleanCheckboxFieldInstance } from "../Selection/BooleanCheckboxField"
import { isRadioButtonFieldInstance } from "../Selection/RadioButtonField"
import { isImageField } from "../Display/ImageField"
import { isHorizontalLineInstance } from "../Display/HorizontalLine"
import { isCheckboxFieldInstance } from "../Selection/CheckboxField"
import { isToggleFieldInstance } from "../Selection/ToggleField"

type SideBySideItem = {
    item: string[]
    width: SAILSideBySideItemWidth
}
const SideBySideItem = ({ item, width }: SideBySideItem): string[] => {
    const code: string[] = []
    code.push(`a!sideBySideItem(`)
    code.push(`  item: {`)
    code.push(...indentStringArray(item, 2))
    code.push(`  },`)
    code.push(`  width: "${width}",`)
    code.push(`),`)
    return code
}

type SideBySideLayout = {
    items: string[]
    alignVertical: SAILSideBySideLayoutAlignVertical
    itemSpacing: SAILSideBySideLayoutItemSpacing
    marginAbove: SAILMargin
    marginBelow: SAILMargin
}
const SideBySideLayout = ({ items, alignVertical, itemSpacing, marginAbove, marginBelow }: SideBySideLayout): string[] => {
    const code: string[] = []

    code.push(`a!sideBySideLayout(`)
    code.push(`  items: {`)
    code.push(...indentStringArray(items, 2))
    code.push(`  },`)
    code.push(`  alignVertical: "${alignVertical}",`)
    code.push(`  spacing: "${itemSpacing}",`)
    code.push(`  marginAbove: "${marginAbove}",`)
    code.push(`  marginBelow: "${marginBelow}",`)
    code.push(`),`)
    return code
}
export const generateSideBySideLayout = (frameNode: FrameNode, childrenCode: string[][]): string[] => {
    const items: string[] = []
    frameNode.children.forEach((child, childIndex) => {
        items.push(...SideBySideItem({
            item: childrenCode[childIndex],
            width: mapToSAILSideBySideItemWidth('layoutSizingHorizontal' in child ? child.layoutSizingHorizontal : 'MINIMIZE'),
        }))
    })

    return SideBySideLayout({
        items,
        alignVertical: mapToSAILSideBySideLayoutAlignVertical(frameNode.counterAxisAlignItems),
        itemSpacing: mapToSAILSideBySideLayoutItemSpacing(frameNode.itemSpacing),
        marginAbove: mapToSAILMargin(frameNode.paddingTop),
        marginBelow: mapToSAILMargin(frameNode.paddingBottom),
    })
}

export const isSideBySideLayoutFrame = async (frameNode: FrameNode): Promise<boolean> => {
    if (frameNode.layoutMode !== 'HORIZONTAL') return false
    if (Array.isArray(frameNode.fills) && frameNode.fills.length !== 0) return false
    if (Array.isArray(frameNode.strokes) && frameNode.strokes.length !== 0) return false

    for (const child of frameNode.children) {
        return await isLayoutFrame(child) || await isValidComponentInstance(child) 
    }

    return true
}

const isLayoutFrame = async (node: SceneNode): Promise<boolean> => {
    if (node.type === 'FRAME') return  await isSideBySideLayoutFrame(node)
        || await isRichTextDisplayFieldFrame(node)
        || await isButtonArrayFrame(node)
        || isImageField(node)

    return false
}

const isValidComponentInstance = async (node: SceneNode): Promise<boolean> => {
    if (node.type === 'INSTANCE') return await isStampFieldInstance(node)
        || await isTextFieldInstance(node)
        || await isParagraphFieldInstance(node)
        || await isDropdownFieldInstance(node)
        || await isBooleanCheckboxFieldInstance(node)
        || await isRadioButtonFieldInstance(node)
        || await isRichTextIcon(node)
        || await isHorizontalLineInstance(node)
        || await isCheckboxFieldInstance(node)
        || await isToggleFieldInstance(node)

    return false
}