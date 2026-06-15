import { getAppliedModes } from "../../Utilities/getAppliedModes"
import { getComponentProps } from "../../Utilities/getComponentProps"
import { getMainComponentName } from "../../Utilities/getMainComponentName"
import { getTooltipValue as getHelpTooltipValue } from "../../Utilities/getTooltipValue"
import { SAILLabelPosition, SAILParagraphHeight, SAILMargin, mapToSAILLabelPosition, mapToSAILParagraphHeight, mapToSAILMargin } from "../SAILParameters"

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

export const generateParagraphField = async (instanceNode: InstanceNode) => {
    const props = getComponentProps(instanceNode)
    const modes = await getAppliedModes(instanceNode)

    return ParagraphField({
        label: props['Label'].value as string, 
        labelPosition: mapToSAILLabelPosition(props['Label Position'].value as string),
        instructions: props['Instructions'].value as string,
        required: props['Is Required'].value as boolean,
        disabled: modes['State'] === 'Disabled',
        readOnly: props['Is Read Only'].value === 'True',
        value: props['Value'].value as string,
        placeholder: props['Placeholder'].value as string,
        height: mapToSAILParagraphHeight(modes['Paragraph Height']),
        // TODO: Character Limit
        helpTooltip: getHelpTooltipValue(instanceNode, props),
        marginAbove: mapToSAILMargin(modes['Margin Above']),
        marginBelow: mapToSAILMargin(modes['Margin Below'])
    })
}

export const isParagraphFieldInstance = async (node: SceneNode): Promise<boolean> => {
    if (node.type === 'INSTANCE'
        && await getMainComponentName(node) === 'Paragraph Field'
    ) return true
    else return false
}