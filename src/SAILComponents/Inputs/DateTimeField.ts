import { booleanProp, stringProp } from "../../typeguards"
import { getAppliedModes } from "../../Utilities/getAppliedModes"
import { getComponentProps } from "../../Utilities/getComponentProps"
import { getMainComponentName } from "../../Utilities/getMainComponentName"
import { mapToSAILLabelPosition, mapToSAILMargin, SAILLabelPosition, SAILMargin } from "../SAILParameters"

type DateTimeFieldProps = {
    label?: string
    labelPosition?: SAILLabelPosition
    instructions?: string
    required?: boolean
    requiredMessage?: string
    disabled?: boolean
    readOnly?: boolean
    helpTooltip?: string
    marginAbove?: SAILMargin
    marginBelow?: SAILMargin
}

const DateField = ({ label, labelPosition, instructions, required, requiredMessage, disabled, readOnly, helpTooltip, marginAbove, marginBelow }: DateTimeFieldProps): string[] => {
    const code: string[] = []

    code.push(`a!dateField(`)
    if (label) code.push(`  label: "${label}",`)
    if (labelPosition) code.push(`  labelPosition: "${labelPosition}",`)
    if (instructions) code.push(`  instructions: "${instructions}",`)
    if (!readOnly && required) code.push(`  required: ${required},`)
    if (required && requiredMessage) code.push(`  requiredMessage: "${requiredMessage}",`)
    if (!readOnly && disabled) code.push(`  disabled: ${disabled},`)
    if (readOnly) code.push(`  readOnly: ${readOnly},`)
    code.push(`  value: today(),`)
    if (helpTooltip) code.push(`  helpTooltip: "${helpTooltip}",`)
    if (marginAbove) code.push(`  marginAbove: "${marginAbove}",`)
    if (marginBelow) code.push(`  marginBelow: "${marginBelow}",`)
    code.push(`),`)

    return code
}

const DateTimeField = ({ label, labelPosition, instructions, required, requiredMessage, disabled, readOnly, helpTooltip, marginAbove, marginBelow }: DateTimeFieldProps): string[] => {
    const code: string[] = []

    code.push(`a!dateTimeField(`)
    if (label) code.push(`  label: "${label}",`)
    if (labelPosition) code.push(`  labelPosition: "${labelPosition}",`)
    if (instructions) code.push(`  instructions: "${instructions}",`)
    if (!readOnly && required) code.push(`  required: ${required},`)
    if (required && requiredMessage) code.push(`  requiredMessage: "${requiredMessage}",`)
    if (!readOnly && disabled) code.push(`  disabled: ${disabled},`)
    if (readOnly) code.push(`  readOnly: ${readOnly},`)
    code.push(`  value: today(),`)
    if (helpTooltip) code.push(`  helpTooltip: "${helpTooltip}",`)
    if (marginAbove) code.push(`  marginAbove: "${marginAbove}",`)
    if (marginBelow) code.push(`  marginBelow: "${marginBelow}",`)
    code.push(`),`)

    return code
}

export const generateDateTimeField = async (instanceNode: InstanceNode): Promise<string[]> => {
    const props = getComponentProps(instanceNode)
    const modes = await getAppliedModes(instanceNode)

    const label = stringProp(props['Label']?.value)
    const labelPosition = mapToSAILLabelPosition(stringProp(props['Label Position']?.value))
    const instructions = props['Show Instructions']?.value === true ? stringProp(props['Instructions']?.value) : undefined
    const required = booleanProp(props['Is Required']?.value)
    const requiredMessage = stringProp(props['Required Message']?.value)
    const disabled = modes['State'] === 'Disabled'
    const readOnly = booleanProp(props['Is Read Only']?.value)
    const helpTooltip = props['Show Help Icon']?.value === true ? stringProp(props['Tooltip/Label']?.value) : undefined
    const marginAbove = mapToSAILMargin(modes['Margin Above'])
    const marginBelow = mapToSAILMargin(modes['Margin Below'])

    if (props['Show Time']?.value === true) {
        return DateTimeField({ label, labelPosition, instructions, required, requiredMessage, disabled, readOnly, helpTooltip, marginAbove, marginBelow })
    } else return DateField({ label, labelPosition, instructions, required, requiredMessage, disabled, readOnly, helpTooltip, marginAbove, marginBelow })
}

export const isDateTimeFieldInstance = async (instanceNode: InstanceNode): Promise<boolean> => {
    const props = getComponentProps(instanceNode)
    const showTime = props['Show Time']?.value
    const nodeMainComponentName = await getMainComponentName(instanceNode)
    
    return nodeMainComponentName === 'Date & Time' && showTime === true
}