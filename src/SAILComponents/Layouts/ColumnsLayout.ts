import { indentStringArray } from "../../Utilities/indent"
import { SAILColumnWidth, SAILColumnsLayoutAlignVertical, SAILColumnsLayoutSpacing, SAILMargin, mapToSAILColumnsLayoutSpacing, mapToSAILColumnWidth, mapToSAILMargin } from "../SAILParameters"

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
    const isGridLayout = frameNode.layoutMode === 'GRID'
    let spacing: SAILColumnsLayoutSpacing = 'STANDARD'

    if (isGridLayout) {
        const rows: string[] = [`{`]
        spacing = mapToSAILColumnsLayoutSpacing(frameNode.gridColumnGap)

        for (let rowIndex = 0; rowIndex < frameNode.gridRowCount; rowIndex++) {
            // TODO: map height to column layout size classes.
            const rowColumns: string[] = []

            for (let columnIndex = 0; columnIndex < frameNode.gridColumnCount; columnIndex++) {
                const width = mapToSAILColumnWidth(frameNode.gridColumnSizes[columnIndex])
                const columnContents: string[] = []

                frameNode.children.forEach((child, childIndex) => {
                    const columnAnchorIndex = 'gridColumnAnchorIndex' in child ? child.gridColumnAnchorIndex : 0
                    const rowAnchorIndex = 'gridRowAnchorIndex' in child ? child.gridRowAnchorIndex : 0

                    if (columnAnchorIndex === columnIndex && rowAnchorIndex === rowIndex) {
                        columnContents.push(...childrenCode[childIndex])
                    }
                })

                rowColumns.push(...ColumnLayout({ contents: columnContents, width }))
            }

            rows.push(
                ...indentStringArray(ColumnsLayout({
                    columns: rowColumns,
                    spacing,
                    marginAbove: mapToSAILMargin(frameNode.paddingTop),
                    marginBelow: mapToSAILMargin(frameNode.paddingBottom),
                }), 1))
        }
        rows.push(`}`)
        return rows

        // for (let columnIndex = 0; columnIndex < frameNode.gridColumnCount; columnIndex++) {
        //     const width = mapToSAILColumnWidth(frameNode.gridColumnSizes[columnIndex])
        //     const columnContents: string[] = []

        //     // frameNode.children.forEach((child, childIndex) => {
        //     //     const columnAnchorIndex = 'gridColumnAnchorIndex' in child ? child.gridColumnAnchorIndex : 0
        //     //     const rowAnchorIndex = 'gridRowAnchorIndex' in child ? child.gridRowAnchorIndex : 0
        //     //     if (columnAnchorIndex === columnIndex && rowAnchorIndex === 0) {
        //     //         columnContents.push(...childrenCode[childIndex])
        //     //     }
        //     // })
        //     // columns.push(...ColumnLayout({ contents: columnContents, width }))
        // }
    } else {
        spacing = mapToSAILColumnsLayoutSpacing(frameNode.itemSpacing)

        frameNode.children.forEach((child, childIndex) => {
            const width = mapToSAILColumnWidth(child.width)
            const contents: string[] = []
            contents.push(...childrenCode[childIndex])
            columns.push(...ColumnLayout({ contents, width }))
        })

        return ColumnsLayout({
            columns,
            spacing,
            marginAbove: mapToSAILMargin(frameNode.paddingTop),
            marginBelow: mapToSAILMargin(frameNode.paddingBottom),
        })
    }
}

export const isColumnsLayoutFrame = (frameNode: FrameNode): boolean => {
    if (Array.isArray(frameNode.fills) && frameNode.fills.length !== 0 || frameNode.strokes.length !== 0) return false
    if (frameNode.layoutMode === 'GRID') return true

    const children = frameNode.children
    if (frameNode.layoutMode === 'HORIZONTAL' && children.every(child => child.type === 'FRAME' || child.type === 'INSTANCE')) return true

    return false
}
