import { booleanProp, stringProp } from "../../typeguards"
import { getAppliedModes } from "../../Utilities/getAppliedModes"
import { __getComponentProps } from "../../Utilities/getComponentProps"
import { getIconNameById } from "../../Utilities/getIconNameById"
import { __getMainComponentName } from "../../Utilities/getMainComponentName"
import { indentStringArray } from "../../Utilities/indent"
import { mapToSAILButtonArrayLayoutAlign, mapToSAILButtonColor, mapToSAILButtonIconPosition, mapToSAILButtonSize, mapToSAILButtonStyle, mapToSAILMargin, SAILButtonArrayLayoutAlign, SAILButtonColor, SAILButtonIconPosition, SAILButtonSize, SAILButtonStyle, SAILButtonWidth, SAILMargin } from "../SAILParameters"

type ButtonWidgetProps = {
    label?: string,
    style?: SAILButtonStyle
    disabled?: boolean
    size?: SAILButtonSize
    width?: SAILButtonWidth
    icon?: string
    tooltip?: string
    iconPosition?: SAILButtonIconPosition
    color?: SAILButtonColor
}

const ButtonWidget = ({ label, style, disabled, size, width, icon, tooltip, iconPosition, color }: ButtonWidgetProps) => {
    const code: string[] = []

    code.push(`a!buttonWidget(`)
    if (label) code.push(`  label: "${label}",`)
    if (style) code.push(`  style: "${style}",`)
    if (disabled) code.push(`  disabled: ${disabled},`)
    if (size) code.push(`  size: "${size}",`)
    if (width) code.push(`  width: "${width}",`)
    if (icon) code.push(`  icon: "${icon}",`)
    if (tooltip) code.push(`  tooltip: "${tooltip}",`)
    if (iconPosition) code.push(`  iconPosition: "${iconPosition}",`)
    if (color) code.push(`  color: "${color}",`)
    code.push(`),`)

    return code
}
export const generateButtonWidget = async (instanceNode: InstanceNode): Promise<string[]> => {
    let label: string = ''
    const appliedModes = await getAppliedModes(instanceNode)
    const props = __getComponentProps(instanceNode)
    let icon: string | undefined
    let iconPosition: SAILButtonIconPosition | undefined
    const iconPositionProp = stringProp(props['Icon Position']?.value)
    const iconNameProp = stringProp(props['Icon']?.value)
    if (iconPositionProp === 'Left' ||
        iconPositionProp === 'Right' ||
        iconPositionProp === 'Icon Only') {
        icon = await getIconNameById(iconNameProp)
        iconPosition = await mapToSAILButtonIconPosition(iconPositionProp)
    }
    if (iconPositionProp === 'Left' ||
        iconPositionProp === 'Right' ||
        iconPositionProp === 'Text Only') {
        label = stringProp(props['Label'].value)
    }

    return ButtonWidget({
        label,
        style: mapToSAILButtonStyle(appliedModes['Btn Style']),
        disabled: booleanProp(props['State']?.value === 'Disabled'),
        size: mapToSAILButtonSize(appliedModes['Btn Size']),
        icon,
        iconPosition,
        color: mapToSAILButtonColor(appliedModes['Color Style'])
    })
}

type ButtonArrayLayout = {
    buttons: ButtonWidgetProps[]
    align?: SAILButtonArrayLayoutAlign
    marginBelow?: SAILMargin
}
export const ButtonArrayLayout = ({ buttons, align, marginBelow = 'NONE' }: ButtonArrayLayout): string[] => {
    const code: string[] = []

    code.push(`a!buttonArrayLayout(`)
    code.push(`  buttons: {`)
    for (const buttonWidget of buttons) {
        code.push(...indentStringArray(ButtonWidget(buttonWidget), 2))
    }
    if (align) code.push(`  align: "${align}",`)
    code.push(`  marginBelow: "${marginBelow}",`)
    code.push(`  },`)
    code.push(`),`)

    return code
}

export const isButtonArrayFrame = async (frameNode: FrameNode): Promise<boolean> => {
    if (frameNode.layoutMode !== 'HORIZONTAL' || frameNode.children.length === 0) return false
    for (const child of frameNode.children) {
        if (child.type !== 'INSTANCE' || await __getMainComponentName(child, 'COMPONENT_SET') !== 'Button') return false
    }
    return true
}

export const generateButtonArrayLayout = async (node: FrameNode | InstanceNode): Promise<string[]> => {
    const code: string[] = []
    const buttons: string[] = []
    const align = node.type === 'FRAME' ? mapToSAILButtonArrayLayoutAlign(node.primaryAxisAlignItems) : 'START'
    const marginBelow = node.type === 'FRAME' ? mapToSAILMargin(node.paddingBottom) : 'NONE'

    if (node.type === 'INSTANCE') {
        buttons.push(...await generateButtonWidget(node))
    } else {
        for (const button of node.children) {
            if (button.type === 'INSTANCE' && await __getMainComponentName(button, 'COMPONENT_SET') === 'Button') {
                buttons.push(...await generateButtonWidget(button))
            }
        }
    }

    code.push(`a!buttonArrayLayout(`)
    code.push(`  align: "${align}",`)
    code.push(`  marginBelow: "${marginBelow}",`)
    code.push(`  buttons: {`)
    code.push(...indentStringArray(buttons, 2))
    code.push(`  },`)
    code.push(`),`)
    return code
}