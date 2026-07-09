import { SAILLabelPosition, SAILMargin, SAILTextAlign } from "../SAILParameters"

export type IntegerField = {
    label?: string
    labelPosition?: SAILLabelPosition
    instructions?: string
    required?: boolean
    disabled?: boolean
    readOnly?: boolean
    value?: number
    placeholder?: string
    align?: SAILTextAlign
    helpTooltip?: string
    marginAbove?: SAILMargin
    marginBelow?: SAILMargin

}
export const IntegerField = ({ label, labelPosition, instructions, required, disabled, readOnly, value, placeholder, align, helpTooltip, marginAbove, marginBelow }: IntegerField): string[] => {
    const code: string[] = []

    code.push(`a!integerField(`)
    if (label) code.push(`  label: "${label}",`)
    if (labelPosition) code.push(`  labelPosition: "${labelPosition}",`)
    if (instructions) code.push(`  instructions: "${instructions}",`)
    if (required) code.push(`  required: ${required},`)
    if (disabled) code.push(`  disabled: ${disabled},`)
    if (readOnly) code.push(`  readOnly: ${readOnly},`)
    if (value) code.push(`  value: ${value},`)
    if (placeholder) code.push(`  placeholder: "${placeholder}",`)
    if (align) code.push(`  align: "${align}",`)
    if (helpTooltip) code.push(`  helpTooltip: "${helpTooltip}",`)
    if (marginAbove) code.push(`  marginAbove: "${marginAbove}",`)
    if (marginBelow) code.push(`  marginBelow: "${marginBelow}",`)
    code.push(`),`)

    return code
}
