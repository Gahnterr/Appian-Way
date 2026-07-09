import { isInstanceNode } from "../../typeguards"
import { getMainComponentName } from "../../Utilities/getMainComponentName"
import { SAILDropdownSearchDisplay, SAILLabelPosition, SAILMargin } from "./SAILParameters"

export type MultipleDropdownField = {
    label?: string
    labelPosition?: SAILLabelPosition
    instructions?: string
    required?: boolean
    disabled?: boolean
    choiceLabels?: string[]
    choiceValues?: number[]
    placeholder?: string
    value?: string[]
    searchDisplay?: SAILDropdownSearchDisplay
    helpTooltip?: string
    marginAbove?: SAILMargin
    marginBelow?: SAILMargin
}
export const MultipleDropdownField = ({ label, labelPosition, instructions, required, disabled, choiceLabels, choiceValues, placeholder, value, searchDisplay, helpTooltip, marginAbove, marginBelow }: MultipleDropdownField): string[] => {
    const code: string[] = []

    code.push(`a!multipleDropdownField(`)
    if (label) code.push(`  label: "${label}",`)
    if (labelPosition) code.push(`  labelPosition: "${labelPosition}",`)
    if (instructions) code.push(`  instructions: "${instructions}",`)
    if (required) code.push(`  required: ${required},`)
    if (disabled) code.push(`  disabled: ${disabled},`)
    if (choiceLabels) code.push(`  choiceLabels: { ${choiceLabels.map(choiceLabel => `"${choiceLabel}"`).join(', ')} },`)
    if (choiceValues) code.push(`  choiceValues: { ${choiceValues.join(', ')} },`)
    if (placeholder) code.push(`  placeholder: "${placeholder}",`)
    if (value) code.push(`  value: { ${value.map(selectedValue => `"${selectedValue}"`).join(', ')} },`)
    if (searchDisplay) code.push(`  searchDisplay: "${searchDisplay}",`)
    if (helpTooltip) code.push(`  helpTooltip: "${helpTooltip}",`)
    if (marginAbove) code.push(`  marginAbove: "${marginAbove}",`)
    if (marginBelow) code.push(`  marginBelow: "${marginBelow}",`)
    code.push(`),`)

    return code
}

export const isMultipleDropdownFieldInstance = async (instanceNode: InstanceNode): Promise<boolean> => {
    const instanceMainComponentName = await getMainComponentName(instanceNode)
    return instanceMainComponentName === 'Multiple Dropdown'
}
