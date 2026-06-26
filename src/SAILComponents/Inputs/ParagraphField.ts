import { booleanProp, stringProp } from "../../typeguards"
import { getAppliedModes } from "../../Utilities/getAppliedModes"
import { __getComponentProps } from "../../Utilities/getComponentProps"
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
    const props = __getComponentProps(instanceNode)
    const modes = await getAppliedModes(instanceNode)

    return ParagraphField({
        label: stringProp(props['Label'].value), 
        labelPosition: mapToSAILLabelPosition(stringProp(props['Label Position'].value)),
        instructions: booleanProp(props['Show Instructions'].value) ? stringProp(props['Instructions'].value) : undefined,
        required: booleanProp(props['Is Required'].value),
        disabled: modes['State'] === 'Disabled',
        readOnly: props['Is Read Only'].value === 'True',
        value: stringProp(props['Value'].value),
        placeholder: stringProp(props['Placeholder'].value),
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