import { getAppliedModes } from "../../Utilities/getAppliedModes"
import { __getMainComponentName } from "../../Utilities/getMainComponentName"
import { indentStringArray } from "../../Utilities/indent"
import { mapToSAILButtonArrayLayoutAlign, mapToSAILButtonColor, mapToSAILButtonIconPosition, mapToSAILButtonSize, mapToSAILButtonStyle, mapToSAILMargin, SAILButtonArrayLayoutAlign, SAILButtonColor, SAILButtonIconPosition, SAILButtonSize, SAILButtonStyle, SAILButtonWidth, SAILMargin } from "../SAILParameters"

type ButtonWidget = {
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

const ButtonWidget = ({ label, style, disabled, size, width, icon, tooltip, iconPosition, color }: ButtonWidget) => {
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
    const disabled: boolean = instanceNode.componentProperties['State'].value === 'Disabled'
    const getIconName = async (id: string): Promise<string> => {
        const iconNode = await figma.getNodeByIdAsync(id)
        return iconNode ? iconNode.name : ''
    }
    let icon: string | undefined
    let iconPosition: SAILButtonIconPosition | undefined
    const iconPositionProp: string = instanceNode.componentProperties['Icon Position'].value as string
    const iconNameProp: string = instanceNode.componentProperties['Icon#614:0'].value as string
    if (iconPositionProp === 'Left' ||
        iconPositionProp === 'Right' ||
        iconPositionProp === 'Icon Only') {
        icon = await getIconName(iconNameProp)
        iconPosition = await mapToSAILButtonIconPosition(iconPositionProp)
    }
    if (iconPositionProp === 'Left' ||
        iconPositionProp === 'Right' ||
        iconPositionProp === 'Text Only') {
        label = instanceNode.componentProperties['Label#614:146'].value as string
    }
    const style: SAILButtonStyle = mapToSAILButtonStyle(appliedModes['Btn Style'])
    const size: SAILButtonSize = mapToSAILButtonSize(appliedModes['Btn Size'])
    const color: SAILButtonColor = mapToSAILButtonColor(appliedModes['Color Style'])

    return ButtonWidget({
        label,
        style,
        disabled,
        size,
        icon,
        iconPosition,
        color
    })
}

type ButtonArrayLayout = {
    buttons: ButtonWidget[]
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