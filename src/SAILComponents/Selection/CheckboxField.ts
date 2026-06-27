import { booleanProp, isSlotNode, stringProp } from "../../typeguards"
import { getAppliedModes } from "../../Utilities/getAppliedModes"
import { getComponentProps } from "../../Utilities/getComponentProps"
import { getComponentSlot, getItemsFromSlot } from "../../Utilities/getComponentSlots"
import { getMainComponentName } from "../../Utilities/getMainComponentName"
import { getTooltipValue } from "../../Utilities/getTooltipValue"
import { mapToSAILChoiceLayout, mapToSAILChoicePosition, mapToSAILChoiceSpacing, mapToSAILChoiceStyle, mapToSAILLabelPosition, mapToSAILMargin, SAILChoiceLayout, SAILChoicePosition, SAILChoiceSpacing, SAILChoiceStyle, SAILLabelPosition, SAILMargin, SAILTextAlign } from "../SAILParameters"

export type CheckboxField = {
    label?: string
    labelPosition?: SAILLabelPosition
    instructions?: string
    required?: boolean
    disabled?: boolean
    choiceLabels?: string[]
    choiceValues?: number[]
    value?: number[]
    choiceLayout?: SAILChoiceLayout
    choiceStyle?: SAILChoiceStyle
    choicePosition?: SAILChoicePosition
    spacing?: SAILChoiceSpacing
    align?: SAILTextAlign
    helpTooltip?: string
    marginAbove?: SAILMargin
    marginBelow?: SAILMargin
}
export const CheckboxField = ({ label, labelPosition, instructions, required, disabled, choiceLabels, choiceValues, value, choiceLayout, choiceStyle, choicePosition, spacing, align, helpTooltip, marginAbove, marginBelow }: CheckboxField): string[] => {
    const code: string[] = []

    code.push(`a!checkboxField(`)
    if (label) code.push(`  label: "${label}",`)
    if (labelPosition) code.push(`  labelPosition: "${labelPosition}",`)
    if (instructions) code.push(`  instructions: "${instructions}",`)
    if (required) code.push(`  required: ${required},`)
    if (disabled) code.push(`  disabled: ${disabled},`)
    if (choiceLabels) code.push(`  choiceLabels: { ${choiceLabels.map(choiceLabel => `"${choiceLabel}"`).join(', ')} },`)
    if (choiceValues) code.push(`  choiceValues: { ${choiceValues.join(', ')} },`)
    if (value) code.push(`  value: { ${value.map(v => `${v}`).join(', ')} },`)
    if (choiceLayout) code.push(`  choiceLayout: "${choiceLayout}",`)
    if (choiceStyle) code.push(`  choiceStyle: "${choiceStyle}",`)
    if (choicePosition) code.push(`  choicePosition: "${choicePosition}",`)
    if (spacing) code.push(`  spacing: "${spacing}",`)
    if (align) code.push(`  align: "${align}",`)
    if (helpTooltip) code.push(`  helpTooltip: "${helpTooltip}",`)
    if (marginAbove) code.push(`  marginAbove: "${marginAbove}",`)
    if (marginBelow) code.push(`  marginBelow: "${marginBelow}",`)
    code.push(`),`)

    return code
}

export const generateCheckboxField = async (instanceNode: InstanceNode): Promise<string[]> => {
    const props = getComponentProps(instanceNode)
    const modes = await getAppliedModes(instanceNode)

    const choiceLabels: string[] = []
    const choiceValues: number[] = []
    const value: number[] = []
    const checkBoxesSlotNode = getComponentSlot(instanceNode, 'Check Boxes')
    const checkBoxItems: InstanceNode[] = isSlotNode(checkBoxesSlotNode) ? getItemsFromSlot(checkBoxesSlotNode).filter(item => item.type === 'INSTANCE') : []
    checkBoxItems.forEach((checkBoxItem, index) => {
        const props = getComponentProps(checkBoxItem)
        choiceLabels.push(stringProp(props['Label']?.value))
        choiceValues.push(index)
        if (props['Is Checked']?.value === 'True') value.push(index)
    })
    
    return CheckboxField({
        label: stringProp(props['Label']?.value),
        labelPosition: mapToSAILLabelPosition(stringProp(props['Label Position']?.value)),
        instructions: props['Show Instructions']?.value === true ? stringProp(props['Instructions']?.value) : undefined,
        required: booleanProp(props['Is Required']?.value),
        disabled: modes['Is Disabled'] === 'Yes',
        choiceLabels,
        choiceValues,
        value,
        choiceLayout: mapToSAILChoiceLayout(stringProp(props['_Check Boxes/Choice Layout']?.value)),
        choiceStyle: mapToSAILChoiceStyle(stringProp(props['_Check Boxes/Choice Style']?.value)),
        choicePosition: mapToSAILChoicePosition(modes['Choice Position']),
        spacing: mapToSAILChoiceSpacing(modes['Spacing (Selection)']),
        helpTooltip: getTooltipValue(instanceNode, props),
        marginAbove: mapToSAILMargin(modes['Margin Above']),
        marginBelow: mapToSAILMargin(modes['Margin Below'])
    })
}

export const isCheckboxFieldInstance = async (instanceNode: InstanceNode): Promise<boolean> => {
    return await getMainComponentName(instanceNode) === 'Check Box Field'
}