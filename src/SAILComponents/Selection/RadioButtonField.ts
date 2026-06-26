import { getAppliedModes } from "../../Utilities/getAppliedModes"
import { __getComponentProps } from "../../Utilities/getComponentProps"
import { getComponentSlot, getItemsFromSlot } from "../../Utilities/getComponentSlots"
import { getMainComponentName } from "../../Utilities/getMainComponentName"
import { getTooltipValue } from "../../Utilities/getTooltipValue"
import { mapToSAILChoiceLayout, mapToSAILChoicePosition, mapToSAILChoiceSpacing, mapToSAILChoiceStyle, mapToSAILLabelPosition, mapToSAILMargin, SAILChoiceLayout, SAILChoicePosition, SAILChoiceSpacing, SAILChoiceStyle, SAILLabelPosition, SAILMargin } from "../SAILParameters"

export type RadioButtonField = {
    label?: string
    labelPosition?: SAILLabelPosition
    instructions?: string
    required?: boolean
    disabled?: boolean
    choiceLabels?: string[]
    choiceValues?: number[]
    value?: number
    choiceLayout?: SAILChoiceLayout
    choiceStyle?: SAILChoiceStyle
    choicePosition?: SAILChoicePosition
    spacing?: SAILChoiceSpacing
    helpTooltip?: string
    marginAbove?: SAILMargin
    marginBelow?: SAILMargin
}
export const RadioButtonField = ({ label, labelPosition, instructions, required, disabled, choiceLabels, choiceValues, value, choiceLayout, choiceStyle, choicePosition, spacing, helpTooltip, marginAbove, marginBelow }: RadioButtonField): string[] => {
    const code: string[] = []

    code.push(`a!radioButtonField(`)
    if (label) code.push(`  label: "${label}",`)
    if (labelPosition) code.push(`  labelPosition: "${labelPosition}",`)
    if (instructions) code.push(`  instructions: "${instructions}",`)
    if (required) code.push(`  required: ${required},`)
    if (disabled) code.push(`  disabled: ${disabled},`)
    if (choiceLabels) code.push(`  choiceLabels: { ${choiceLabels.map(choiceLabel => `"${choiceLabel}"`).join(', ')} },`)
    if (choiceValues) code.push(`  choiceValues: { ${choiceValues.join(', ')} },`)
    if (value !== undefined) code.push(`  value: ${value},`)
    if (choiceLayout) code.push(`  choiceLayout: "${choiceLayout}",`)
    if (choiceStyle) code.push(`  choiceStyle: "${choiceStyle}",`)
    if (choicePosition) code.push(`  choicePosition: "${choicePosition}",`)
    if (spacing) code.push(`  spacing: "${spacing}",`)
    if (helpTooltip) code.push(`  helpTooltip: "${helpTooltip}",`)
    if (marginAbove) code.push(`  marginAbove: "${marginAbove}",`)
    if (marginBelow) code.push(`  marginBelow: "${marginBelow}",`)
    code.push(`),`)

    return code
}

export const generateRadioButtonField = async (instanceNode: InstanceNode): Promise<string[]> => {
    const radioButtonsInstanceNode = instanceNode.findOne(node => node.type === 'INSTANCE' && node.name === '_Radio Buttons') as InstanceNode
    const props = __getComponentProps(instanceNode, radioButtonsInstanceNode)
    const modes = await getAppliedModes(instanceNode)

    const choiceLabels: string[] = []
    const choiceValues: number[] = []
    const radioButtonsSlotNode = getComponentSlot(instanceNode, 'Radio Buttons') as SlotNode
    const radioButtonItems: InstanceNode[] = getItemsFromSlot(radioButtonsSlotNode).filter(item => item.type === 'INSTANCE')
    radioButtonItems.forEach((radioButtonItem, index) => {
        const props = __getComponentProps(radioButtonItem)
        choiceLabels.push(props['Label'].value as string)
        choiceValues.push(index)
    })
    
    return RadioButtonField({
        label: props['Label'].value as string,
        labelPosition: mapToSAILLabelPosition(props['Label Position'].value as string),
        instructions: props['Show Instructions'].value ? props['Instructions'].value as string : undefined,
        required: props['Is Required'].value as boolean,
        disabled: modes['Is Disabled'] === 'Yes',
        choiceLabels,
        choiceValues,
        value: 0,
        choiceLayout: mapToSAILChoiceLayout(props['Choice Layout']?.value as string ?? undefined),
        choiceStyle: mapToSAILChoiceStyle(props['Choice Style']?.value as string ?? undefined),
        choicePosition: mapToSAILChoicePosition(modes['Choice Position']),
        spacing: mapToSAILChoiceSpacing(modes['Spacing (Selection)']),
        helpTooltip: getTooltipValue(instanceNode, props),
        marginAbove: mapToSAILMargin(modes['Margin Above']),
        marginBelow: mapToSAILMargin(modes['Margin Below'])
    })
}

export const isRadioButtonFieldInstance = async (instanceNode: InstanceNode): Promise<boolean> => {
    return await getMainComponentName(instanceNode) === 'Radio Buttons Field'
}