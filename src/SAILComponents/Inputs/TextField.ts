import { getAppliedModes } from "../../Utilities/getAppliedModes"
import { getComponentProps } from "../../Utilities/getComponentProps"
import { getMainComponentName } from "../../Utilities/getMainComponentName"
import { mapToSAILLabelPosition, mapToSAILMargin, mapToSAILTextAlign, SAILLabelPosition, SAILMargin, SAILTextAlign } from "../SAILParameters"

export type TextField = {
    label?: string
    labelPosition?: SAILLabelPosition
    instructions?: string
    required?: boolean
    requiredMessage?: string
    disabled?: boolean
    readOnly?: boolean
    value?: string
    placeholder?: string
    align?: SAILTextAlign
    characterLimit?: number
    helpTooltip?: string
    marginAbove?: SAILMargin
    marginBelow?: SAILMargin
}
export const TextField = ({ label, labelPosition, instructions, required, requiredMessage, disabled, readOnly, value, placeholder, align, characterLimit, helpTooltip, marginAbove, marginBelow }: TextField): string[] => {
    const code: string[] = []

    code.push(`a!textField(`)
    if (label) code.push(`  label: "${label}",`)
    if (labelPosition) code.push(`  labelPosition: "${labelPosition}",`)
    if (instructions) code.push(`  instructions: "${instructions}",`)
    if (required) code.push(`  required: ${required},`)
    if (requiredMessage) code.push(`  requiredMessage: "${requiredMessage}",`)
    if (disabled) code.push(`  disabled: ${disabled},`)
    if (readOnly) code.push(`  readOnly: ${readOnly},`)
    if (value) code.push(`  value: "${value}",`)
    if (placeholder) code.push(`  placeholder: "${placeholder}",`)
    if (align) code.push(`  align: "${align}",`)
    if (characterLimit) code.push(`  characterLimit: ${characterLimit},`)
    if (helpTooltip) code.push(`  helpTooltip: "${helpTooltip}",`)
    if (marginAbove) code.push(`  marginAbove: "${marginAbove}",`)
    if (marginBelow) code.push(`  marginBelow: "${marginBelow}",`)
    code.push(`),`)

    return code
}

export const generateTextField = async (instanceNode: InstanceNode): Promise<string[]> => {
    const props = getComponentProps(instanceNode)
    const modes = await getAppliedModes(instanceNode)

    let align: SAILTextAlign = 'LEFT'
    if (props['Is Read Only'].value === 'True') {
        const valueFrame: TextNode = instanceNode.findChild(child => child.type === 'TEXT' && child.name === 'Value') as TextNode
        align = mapToSAILTextAlign(valueFrame.textAlignHorizontal)
    }

    return TextField({
        label: props['Label'].value as string,
        labelPosition: mapToSAILLabelPosition(props['Label Position'].value as string),
        value: props['Has Value'].value ? props['Value'].value as string : undefined,
        placeholder: props['Placeholder'].value as string,
        readOnly: props['Is Read Only'].value === 'True',
        marginAbove: mapToSAILMargin(modes['Margin Above']),
        marginBelow: mapToSAILMargin(modes['Margin Below']),
        required: props['Is Required'].value as boolean,
        requiredMessage: props['Required Message'].value as string,
        instructions: props['Show Instructions'].value as boolean ? props['Instructions'].value as string : undefined,
        align,
        disabled: modes['State'] === 'Disabled'
    })
}

export const isTextFieldInstance = async (node: SceneNode): Promise<boolean> => {
    if (node.type === 'INSTANCE'
        && await getMainComponentName(node) === 'Text Field') return true
    else return false
}