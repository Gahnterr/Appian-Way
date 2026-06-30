import { isFrameNode, stringProp } from "../../typeguards"
import { getAppliedModes } from "../../Utilities/getAppliedModes"
import { getComponentProps } from "../../Utilities/getComponentProps"
import { getIconNameById } from "../../Utilities/getIconNameById"
import { getLastFillFromNode } from "../../Utilities/getLast__FromNode"
import { getMainComponentName } from "../../Utilities/getMainComponentName"
import { RGBToHexColor, toHexColor } from "../../Utilities/rgbColorToHexColor"
import { isSAILIcon, mapToSAILIcon, mapToSAILMargin, mapToSAILStampSize, SAILIcon, SAILMargin, SAILStampSize } from "../SAILParameters"

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
    const props = getComponentProps(instanceNode)
    const modes = await getAppliedModes(instanceNode)

    let backgroundColor = 'ACCENT'
    const stampFrame = instanceNode.findChild(node => node.name === 'Stamp' && node.type === 'FRAME')
    if (stampFrame && isFrameNode(stampFrame)) {
        const stampFrameLastFill: RGB = getLastFillFromNode(stampFrame, true)
        backgroundColor = RGBToHexColor(stampFrameLastFill)
    }

    return StampField({
        icon: mapToSAILIcon(stringProp(props['Icon']?.value)),
        text: stringProp(props['Text']?.value), 
        backgroundColor, 
        contentColor: 'STANDARD', 
        size: mapToSAILStampSize(modes['Stamp Size']), 
        marginAbove: mapToSAILMargin(modes['Margin Above']), 
        marginBelow: mapToSAILMargin(modes['Margin Below'])
    })
}

export const isStampFieldInstance = async (instanceNode: InstanceNode): Promise<boolean> => {
    const componentName = await getMainComponentName(instanceNode)
    return instanceNode.type === 'INSTANCE' && componentName === 'Stamp'
}