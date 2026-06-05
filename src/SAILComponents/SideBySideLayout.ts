import { indentStringArray } from "../indent"
import { mapToSAILMargin, mapToSAILSideBySideItemWidth, mapToSAILSideBySideLayoutAlignVertical, mapToSAILSideBySideLayoutItemSpacing, SAILMargin, SAILSideBySideItemWidth, SAILSideBySideLayoutAlignVertical, SAILSideBySideLayoutItemSpacing } from "./SAILParameters"

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
    code.push(`  itemSpacing: "${itemSpacing}",`)
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
            width: mapToSAILSideBySideItemWidth('layoutSizingHorizontal' in child ? child.layoutSizingHorizontal : 'FILL'),
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