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
import { isDateFieldInstance } from "../Inputs/DateField"
import { isDateTimeFieldInstance } from "../Inputs/DateTimeField"
import { isMultipleDropdownFieldInstance } from "../Selection/MultipleDropdownField"
import { isSegmentedControllerInstance } from "../Selection/SegmentedController"
import { isTagFieldInstance } from "../Display/TagField"
import { isTextNode } from "../../typeguards"

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

export const isSideBySideLayoutFrame = async (frameNode: FrameNode, isSideBySideContent = false): Promise<boolean> => {
    if ((Array.isArray(frameNode.fills) && frameNode.fills.length !== 0)
        || (Array.isArray(frameNode.strokes) && frameNode.strokes.length !== 0)
        || (frameNode.paddingTop > 0 || frameNode.paddingBottom > 0 || frameNode.paddingLeft > 0 || frameNode.paddingRight > 0)) {
        return false
    }

    if (frameNode.layoutMode === 'HORIZONTAL' || (isSideBySideContent && frameNode.layoutMode === 'VERTICAL')) {
        for (const child of frameNode.children) {
            if (await isValidSideBySideInnerItem(child, isSideBySideContent)) {
                return true
            }
        }
    }

    return false
}

const isLayoutFrame = async (node: SceneNode, isSideBySideContent: boolean): Promise<boolean> => {
    if (node.type === 'FRAME') return  await isSideBySideLayoutFrame(node, isSideBySideContent)
        || await isRichTextDisplayFieldFrame(node)
        || await isButtonArrayFrame(node)
        || isImageField(node)
        || node.children.every(child => isTextNode(child))

    return false
}

const isSupportedInstanceNode = async (node: SceneNode): Promise<boolean> => {
    if (node.type === 'INSTANCE') { 
        // Input
        return await isDateFieldInstance(node) 
        || await isDateTimeFieldInstance(node)
        || await isParagraphFieldInstance(node)
        || await isTextFieldInstance(node)
        // Selection
        || await isBooleanCheckboxFieldInstance(node)
        || await isCheckboxFieldInstance(node)
        || isStampFieldInstance(node)
        || await isDropdownFieldInstance(node)
        || await isMultipleDropdownFieldInstance(node)
        || await isRadioButtonFieldInstance(node)
        || await isSegmentedControllerInstance(node)
        || await isToggleFieldInstance(node)
        // Display
        || await isHorizontalLineInstance(node)
        || await isRichTextIcon(node)
        || await isStampFieldInstance(node)
        || await isTagFieldInstance(node)
    }

    return false
}

export async function isValidSideBySideInnerItem(child: SceneNode, isSideBySideContent: boolean) {
    return await isLayoutFrame(child, isSideBySideContent)
        || await isSupportedInstanceNode(child)
        || child.type === 'TEXT'
        || child.type === 'RECTANGLE'
        || child.type === 'VECTOR'
        || child.type === 'LINE'
}
