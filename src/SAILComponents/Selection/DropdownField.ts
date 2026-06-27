import { stringProp } from "../../typeguards"
import { getAppliedModes } from "../../Utilities/getAppliedModes"
import { getComponentProps } from "../../Utilities/getComponentProps"
import { getMainComponentName } from "../../Utilities/getMainComponentName"
import { getTooltipValue } from "../../Utilities/getTooltipValue"
import { SAILLabelPosition, SAILDropdownSearchDisplay, SAILMargin, mapToSAILLabelPosition, mapToSAILMargin } from "../SAILParameters"

export type DropdownField = {
    label?: string
    labelPosition?: SAILLabelPosition
    instructions?: string
    required?: boolean
    disabled?: boolean
    choiceLabels?: string[]
    choiceValues?: number[]
    placeholder?: string
    value?: number
    searchDisplay?: SAILDropdownSearchDisplay
    helpTooltip?: string
    marginAbove?: SAILMargin
    marginBelow?: SAILMargin
}
export const DropdownField = ({ label, labelPosition, instructions, required, disabled, choiceLabels, choiceValues, placeholder, value, searchDisplay, helpTooltip, marginAbove, marginBelow }: DropdownField): string[] => {
    const code: string[] = []

    code.push(`a!dropdownField(`)
    if (label) code.push(`  label: "${label}",`)
    if (labelPosition) code.push(`  labelPosition: "${labelPosition}",`)
    if (instructions) code.push(`  instructions: "${instructions}",`)
    if (required) code.push(`  required: ${required},`)
    if (disabled) code.push(`  disabled: ${disabled},`)
    if (choiceLabels) code.push(`  choiceLabels: { ${choiceLabels.map(choiceLabel => `"${choiceLabel}"`).join(', ')} },`)
    if (choiceValues) code.push(`  choiceValues: { ${choiceValues.join(', ')} },`)
    if (placeholder) code.push(`  placeholder: "${placeholder}",`)
    if (value !== undefined) code.push(`  value: ${value},`)
    if (searchDisplay) code.push(`  searchDisplay: "${searchDisplay}",`)
    if (helpTooltip) code.push(`  helpTooltip: "${helpTooltip}",`)
    if (marginAbove) code.push(`  marginAbove: "${marginAbove}",`)
    if (marginBelow) code.push(`  marginBelow: "${marginBelow}",`)
    code.push(`),`)

    return code
}
export const generateDropdownField = async (instanceNode: InstanceNode): Promise<string[]> => {
    const props = getComponentProps(instanceNode)
    const modes = await getAppliedModes(instanceNode)
    
    return DropdownField({
        label: props['Label'].value as string | undefined,
        labelPosition: mapToSAILLabelPosition(props['Label Position'].value as string),
        instructions: props['Show Instructions'].value ? props['Instructions'].value as string : undefined,
        required: props['Is Required'].value as boolean,
        disabled: modes['Is Disabled'] === 'Yes',
        choiceLabels: props['Has Value'].value ? [stringProp(props['Value'].value)] : undefined,
        choiceValues: [0],
        placeholder: props['Placeholder'].value as string | undefined,
        value: 0,
        helpTooltip: getTooltipValue(instanceNode, props),
        marginAbove: mapToSAILMargin(modes['Margin Above']),
        marginBelow: mapToSAILMargin(modes['Margin Below'])
    })
}

export const isDropdownFieldInstance = async (instanceNode: InstanceNode): Promise<boolean> => {
    return await getMainComponentName(instanceNode) === 'Radio Buttons Field'
}
