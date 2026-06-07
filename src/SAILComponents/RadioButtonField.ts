import { SAILChoiceLayout, SAILChoicePosition, SAILChoiceSpacing, SAILChoiceStyle, SAILLabelPosition, SAILMargin } from "./SAILParameters"

export type RadioButtonField = {
    label?: string
    labelPosition?: SAILLabelPosition
    instructions?: string
    required?: boolean
    disabled?: boolean
    choiceLabels?: string[]
    choiceValues?: number[]
    value?: string
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
    if (value) code.push(`  value: "${value}",`)
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
