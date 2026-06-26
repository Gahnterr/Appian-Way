import { booleanProp, stringProp } from "../../typeguards"
import { getAppliedModes } from "../../Utilities/getAppliedModes"
import { __getComponentProps } from "../../Utilities/getComponentProps"
import { getMainComponentName } from "../../Utilities/getMainComponentName"
import { getTooltipValue as getHelpTooltipValue } from "../../Utilities/getTooltipValue"
import { mapToSAILChoicePosition, mapToSAILMargin, SAILChoicePosition, SAILMargin } from "../SAILParameters"

type ToggleFieldProps = {
    choiceLabel?: string,
    helpTooltip?: string,
    value: boolean,
    required?: boolean,
    requiredMessage?: string,
    disabled?: boolean,
    marginAbove?: SAILMargin,
    marginBelow?: SAILMargin,
    choicePosition?: SAILChoicePosition
}

const ToggleField = ({
    choiceLabel,
    helpTooltip,
    value = false,
    required,
    requiredMessage,
    disabled,
    marginAbove,
    marginBelow = 'STANDARD',
    choicePosition
}: ToggleFieldProps): string[] => {
    const code: string[] = []

    code.push(`a!toggleField(`)
    code.push(`  choiceLabel: "${choiceLabel}",`)
    if (helpTooltip) code.push(`  helpTooltip: "${helpTooltip}",`)
    code.push(`  value: ${value},`)
    if (required) code.push(`  required: ${required},`)
    if (requiredMessage) code.push(`  requiredMessage: "${requiredMessage}",`)
    if (disabled) code.push(`  disabled: ${disabled},`)
    code.push(`  marginAbove: "${marginAbove}",`)
    code.push(`  marginBelow: "${marginBelow}",`)
    if (choicePosition) code.push(`  choicePosition: "${choicePosition}",`)
    code.push(`),`)

    return code
} 

export const generateToggleField = async (instanceNode: InstanceNode): Promise<string[]> => {
    const props = __getComponentProps(instanceNode)
    const modes = await getAppliedModes(instanceNode)

    return ToggleField({
        choiceLabel: stringProp(props['Label']?.value),
        helpTooltip: getHelpTooltipValue(instanceNode, props),
        value: booleanProp(props['Is Toggled']?.value),
        required: booleanProp(props['Is Required']?.value),
        requiredMessage: booleanProp(props['Show Required Message']?.value) ? stringProp(props['Required Message'].value) : undefined,
        disabled: booleanProp(props['Is Disabled']?.value),
        marginAbove: mapToSAILMargin(modes['Margin Above']),
        marginBelow: mapToSAILMargin(modes['Margin Below']),
        choicePosition: mapToSAILChoicePosition(modes['Choice Position'])
    })
}

export const isToggleFieldInstance = async (instanceNode: InstanceNode): Promise<boolean> => {
    const mainComponentName = await getMainComponentName(instanceNode)
    return mainComponentName === 'Toggle'
}