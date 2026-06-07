import { SAILChoiceLayout, SAILChoicePosition, SAILChoiceSpacing, SAILChoiceStyle, SAILLabelPosition, SAILMargin, SAILTextAlign } from "./SAILParameters"

export type CheckboxField = {
    label?: string
    labelPosition?: SAILLabelPosition
    instructions?: string
    required?: boolean
    disabled?: boolean
    choiceLabels?: string[]
    choiceValues?: number[]
    value?: string[]
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
    if (value) code.push(`  value: { ${value.map(selectedValue => `"${selectedValue}"`).join(', ')} },`)
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
