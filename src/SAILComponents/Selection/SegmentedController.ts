import { isInstanceNodesArray, isSlotNode, stringProp } from "../../typeguards"
import { convertArrayToSAILList } from "../../Utilities/convertArrayToSAILList"
import { __getComponentProps } from "../../Utilities/getComponentProps"
import { getItemsFromSlot } from "../../Utilities/getComponentSlots"
import { getIconNameById } from "../../Utilities/getIconNameById"
import { isSAILIcon, mapToSAILLabelPosition, mapToSAILMargin, SAILColumnWidth, SAILIcon, SAILLabelPosition, SAILMargin } from "../SAILParameters"

type SegmentedControllerProps = {
    choiceLabels: string[],
    choiceValues: number[],
    width?: SAILColumnWidth,
    choiceIcons?: SAILIcon[],
    choiceTooltips?: string[],
    label?: string,
    labelPosition?: SAILLabelPosition,
    labelWidth?: SAILColumnWidth,
    choicesWidth?: SAILColumnWidth,
    marginAbove?: SAILMargin,
    marginBelow?: SAILMargin,
    disable?: boolean
}

const SegmentedController = ({
    choiceLabels, choiceValues, choiceIcons, choiceTooltips, label, labelPosition, marginAbove, marginBelow, disable
}: SegmentedControllerProps): string[] => {
    const code: string[] = []

    code.push(`rule!VC_SegmentedController(`)
    code.push(`  choiceLabels: { ${convertArrayToSAILList(choiceLabels)} },`)
    code.push(`  choiceValues: { ${convertArrayToSAILList(choiceValues)} },`)
    code.push(`  value: 0,`)
    if (choiceIcons) code.push(`  choiceIcons: { ${convertArrayToSAILList(choiceIcons)} },`)
    if (choiceTooltips) code.push(`  choiceTooltips: { ${convertArrayToSAILList(choiceTooltips)} },`)
    if (label) code.push(`  label: "${label}",`)
    if (labelPosition) code.push(`  labelPosition: "${labelPosition}",`)
    if (marginAbove) code.push(`  marginAbove: "${marginAbove}",`)
    if (marginBelow) code.push(`  marginBelow: "${marginBelow}",`)
    if (disable) code.push(`  disable: ${disable},`)
    code.push(`),`)

    return code
}

export const generateSegmentedController = async (instanceNode: InstanceNode): Promise<string[]> => {
    const props = __getComponentProps(instanceNode)

    const choiceLabels: string[] = []
    const choiceValues: number[] = []
    const choiceIcons: SAILIcon[] = []
    const choiceTooltips: string[] = []
    const segmentsSlot = instanceNode.findChild(n => n.type === 'SLOT' && n.name === 'Segments') ?? undefined
    if (isSlotNode(segmentsSlot)) {
        const segments = getItemsFromSlot(segmentsSlot)
            .filter(child => child.type === 'INSTANCE' && child.name === 'Segment')
        if (isInstanceNodesArray(segments)) {
            for (const [index, segment] of segments.entries()) {
                const segmentProps = __getComponentProps(segment)
                const icon = await getIconNameById(stringProp(segmentProps['Icon']?.value))
                choiceLabels.push(stringProp(segmentProps['Label']?.value))
                choiceTooltips.push(stringProp(segmentProps['Label']?.value))
                choiceValues.push(index)
                if (isSAILIcon(icon)
                    && (segmentProps['Type']?.value === 'Icon + Label'
                        || segmentProps['Type']?.value === 'Icon Only')) choiceIcons.push(icon)
                else choiceIcons.push('')
            }
        }
    }

    // TODO: Handle choice and label widths. It should detect the width of the nodes in figma and map them to the closest SAIL width class or to AUTO if it's set to fill. 
    //       Should also update the component set so that it uses the column width variables.

    return SegmentedController({
        choiceLabels,
        choiceValues,
        choiceIcons,
        choiceTooltips,
        label: stringProp(props['Label']?.value),
        labelPosition: mapToSAILLabelPosition(stringProp(props['Label Position']?.value)),
        marginAbove: mapToSAILMargin(stringProp(props['Margin Above']?.value)),
        marginBelow: mapToSAILMargin(stringProp(props['Margin Below']?.value))
    })
}