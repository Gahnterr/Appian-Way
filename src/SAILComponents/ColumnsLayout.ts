import { indentStringArray } from "../indent"
import { mapToSAILColumnsLayoutSpacing, mapToSAILColumnWidth, mapToSAILMargin, SAILColumnsLayoutAlignVertical, SAILColumnsLayoutSpacing, SAILColumnWidth, SAILMargin } from "./SAILParameters"

type ColumnLayout = {
    contents: string[]
    width: SAILColumnWidth
}
const ColumnLayout = ({ contents, width }: ColumnLayout): string[] => {
    const code: string[] = []

    code.push(`a!columnLayout(`)
    code.push(`  contents: {`)
    code.push(...indentStringArray(contents, 2))
    code.push(`  },`)
    code.push(`  width: "${width}",`)
    code.push(`),`)

    return code
}

type ColumnsLayout = {
    columns: string[]
    alignVertical?: SAILColumnsLayoutAlignVertical
    spacing?: SAILColumnsLayoutSpacing
    marginAbove?: SAILMargin
    marginBelow?: SAILMargin
}
const ColumnsLayout = ({
    columns,
    alignVertical = 'TOP',
    spacing = 'STANDARD',
    marginAbove = 'NONE',
    marginBelow = 'STANDARD',
}: ColumnsLayout): string[] => {
    const code: string[] = []

    code.push(`a!columnsLayout(`)
    code.push(`  columns: {`)
    code.push(...indentStringArray(columns, 2))
    code.push(`  },`)
    code.push(`  alignVertical: "${alignVertical}",`)
    code.push(`  spacing: "${spacing}",`)
    code.push(`  marginAbove: "${marginAbove}",`)
    code.push(`  marginBelow: "${marginBelow}",`)
    code.push(`),`)

    return code
}

export const generateColumnsLayout = (frameNode: FrameNode, childrenCode: string[][]): string[] => {
    const columns: string[] = []

    for (let columnIndex = 0; columnIndex < frameNode.gridColumnCount; columnIndex++) {
        const width = mapToSAILColumnWidth(frameNode.gridColumnSizes[columnIndex])
        const contents: string[] = []
        frameNode.children.forEach((child, childIndex) => {
            const columnAnchorIndex = 'gridColumnAnchorIndex' in child ? child.gridColumnAnchorIndex : 0
            const rowAnchorIndex = 'gridRowAnchorIndex' in child ? child.gridRowAnchorIndex : 0
            if (columnAnchorIndex === columnIndex && rowAnchorIndex === 0) {
                contents.push(...childrenCode[childIndex])
            }
        })
        columns.push(...ColumnLayout({ contents, width }))
    }

    return ColumnsLayout({
        columns,
        spacing: mapToSAILColumnsLayoutSpacing(frameNode.gridColumnGap),
        marginAbove: mapToSAILMargin(frameNode.paddingTop),
        marginBelow: mapToSAILMargin(frameNode.paddingBottom),
    })
}
