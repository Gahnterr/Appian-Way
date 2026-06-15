import { getAppliedModes } from "../../Utilities/getAppliedModes"
import { __getMainComponentName, getMainComponentName } from "../../Utilities/getMainComponentName"
import { toHexColor } from "../../Utilities/rgbColorToHexColor"
import { mapToSAILMargin, mapToSAILStampSize, SAILIcon, SAILMargin, SAILStampSize } from "../SAILParameters"

type StampFieldProps = {
    icon?: SAILIcon
    text?: string
    backgroundColor: 'ACCENT' | 'POSITIVE' | 'NEGATIVE' | 'SECONDARY' | 'TRANSPARENT' | string
    contentColor: 'STANDARD' | 'ACCENT' | 'POSITIVE' | 'NEGATIVE'
    size?: SAILStampSize
    marginAbove?: SAILMargin
    marginBelow?: SAILMargin
    shape?: 'ROUNDED' | 'SEMI_ROUNDED' | 'SQUARED'
}

const StampField = ({
    icon, text, backgroundColor = 'ACCENT', contentColor = 'STANDARD', size, marginAbove, marginBelow, shape
}: StampFieldProps): string[] => {
    const code: string[] = []

    code.push(`a!stampField(`)
    code.push(`  labelPosition: "COLLAPSED",`)
    if (icon) code.push(`  icon: "${icon}",`)
    if (text) code.push(`  text: "${text}",`)
    code.push(`  backgroundColor: "${backgroundColor}",`)
    code.push(`  contentColor: "${contentColor}",`)
    if (size) code.push(`  size: "${size}",`)
    if (shape) code.push(`  shape: "${shape}",`)
    if (marginAbove) code.push(`  marginAbove: "${marginAbove}",`)
    if (marginBelow) code.push(`  marginBelow: "${marginBelow}",`)
    code.push(`),`)
    return code
}

export const generateStampField = async (instanceNode: InstanceNode): Promise<string[]> => {
    const appliedModes = await getAppliedModes(instanceNode)
    const textProp = instanceNode.componentProperties['Text#1042:0'].value as string
    const typeProp = instanceNode.componentProperties['Type'].value as string
    const iconNodeId = instanceNode.componentProperties['Icon#807:25'].value as string
    let icon: SAILIcon | undefined
    let text: string | undefined

    switch (typeProp) {
        case 'Text Only': {
            text = textProp as string
        }; break
        case 'Icon Only': {
            const iconNode = await figma.getNodeByIdAsync(iconNodeId)
            icon = iconNode?.name as SAILIcon
        }; break
        case 'Icon + Text': {
            text = textProp
            const iconNode = await figma.getNodeByIdAsync(iconNodeId)
            icon = iconNode?.name as SAILIcon
        }; break
        default: break
    }

    let backgroundColor = 'ACCENT'
    const stampFrame = instanceNode.findOne(node => node.name === 'Stamp' && node.type === 'FRAME')
    if (stampFrame) {
        const fill: RGB = stampFrame.type === 'FRAME' && Array.isArray(stampFrame.fills)
            ? stampFrame.fills[0].color
            : {r: 0, g: 0, b: 0}
        backgroundColor = toHexColor(fill.r, fill.g, fill.b)
    }

    const size: SAILStampSize = mapToSAILStampSize(appliedModes['Stamp Size'])
    const marginAbove: SAILMargin = mapToSAILMargin(appliedModes['Margin Above'])
    const marginBelow: SAILMargin = mapToSAILMargin(appliedModes['Margin Below'])

    return StampField({
        icon, text, backgroundColor, contentColor: 'STANDARD', size, marginAbove, marginBelow
    })
}

export const isStampFieldInstance = async (instanceNode: InstanceNode): Promise<boolean> => {
    const componentName = await getMainComponentName(instanceNode)
    return instanceNode.type === 'INSTANCE' && componentName === 'Stamp'
}