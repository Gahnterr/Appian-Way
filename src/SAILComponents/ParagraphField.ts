import { SAILLabelPosition, SAILMargin, SAILParagraphHeight } from "./SAILParameters"

export type ParagraphField = {
    label?: string
    labelPosition?: SAILLabelPosition
    instructions?: string
    required?: boolean
    disabled?: boolean
    readOnly?: boolean
    value?: string
    placeholder?: string
    height?: SAILParagraphHeight
    characterLimit?: number
    helpTooltip?: string
    marginAbove?: SAILMargin
    marginBelow?: SAILMargin
}
export const ParagraphField = ({ label, labelPosition, instructions, required, disabled, readOnly, value, placeholder, height, characterLimit, helpTooltip, marginAbove, marginBelow }: ParagraphField): string[] => {
    const code: string[] = []

    code.push(`a!paragraphField(`)
    if (label) code.push(`  label: "${label}",`)
    if (labelPosition) code.push(`  labelPosition: "${labelPosition}",`)
    if (instructions) code.push(`  instructions: "${instructions}",`)
    if (required) code.push(`  required: ${required},`)
    if (disabled) code.push(`  disabled: ${disabled},`)
    if (readOnly) code.push(`  readOnly: ${readOnly},`)
    if (value) code.push(`  value: "${value}",`)
    if (placeholder) code.push(`  placeholder: "${placeholder}",`)
    if (height) code.push(`  height: "${height}",`)
    if (characterLimit) code.push(`  characterLimit: ${characterLimit},`)
    if (helpTooltip) code.push(`  helpTooltip: "${helpTooltip}",`)
    if (marginAbove) code.push(`  marginAbove: "${marginAbove}",`)
    if (marginBelow) code.push(`  marginBelow: "${marginBelow}",`)
    code.push(`),`)

    return code
}
