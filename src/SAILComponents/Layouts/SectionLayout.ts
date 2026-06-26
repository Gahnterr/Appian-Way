import { booleanProp, stringProp } from "../../typeguards"
import { getAppliedModes } from "../../Utilities/getAppliedModes"
import { __getComponentProps } from "../../Utilities/getComponentProps"
import { getLastFillFromNode, getLastStrokeFromNode } from "../../Utilities/getLast__FromNode"
import { indentStringArray } from "../../Utilities/indent"
import { RGBAToHexColor, toHexColor } from "../../Utilities/rgbColorToHexColor"
import { mapToSAILMargin, SAILIcon, SAILMargin, isSAILIcon } from "../SAILParameters"

type SAILSectionLayoutLabelSize = 'EXTRA_SMALL' | 'SMALL' | 'MEDIUM' | 'MEDIUM_PLUS' | 'LARGE' | 'LARGE_PLUS'
const mapToSAILSectionLayoutLabelSize = (size: string):SAILSectionLayoutLabelSize => {
    switch (size) {
        case 'Extra Small': return 'EXTRA_SMALL'
        case 'Small': return 'SMALL'
        case 'Medium': return 'MEDIUM'
        case 'Medium Plus': return 'MEDIUM_PLUS'
        case 'Large': return 'LARGE'
        case 'Large Plus': return 'LARGE_PLUS'
        default: return 'MEDIUM'
    }
}

type SAILSectionLayoutDivider = 'NONE' | 'ABOVE' | 'BELOW'
const mapToSAILSectionLayoutDivider = (divider: string): SAILSectionLayoutDivider => {
    switch (divider) {
        case 'None': return 'NONE'
        case 'Above': return 'ABOVE'
        case 'Below': return 'BELOW'
        default: return 'NONE'
    }
}

type SAILSectionLayoutDividerColor = 'SECONDARY' | 'STANDARD' | 'ACCENT' | string
const mapToSAILSectionLayoutDividerColor = (color: RGBA): SAILSectionLayoutLabelColor => {
    const hexColor = RGBAToHexColor(color)
    switch (hexColor) {
        case '#222222FF': return 'STANDARD'
        case '#D4D4D4FF': return 'SECONDARY'
        case '#A3239EFF': return 'ACCENT'
        default: return hexColor
    }
}

type SAILSectionLayoutLabelColor = 'ACCENT' | 'STANDARD' | 'POSITIVE' | 'NEGATIVE' | 'SECONDARY' | string
const mapToSAILSectionLayoutLabelColor = (color: RGB): SAILSectionLayoutLabelColor => {
    const hexColor = toHexColor(color.r, color.g, color.b)

    switch (hexColor) {
        case '#222222': return 'STANDARD'
        case '#6B6B6B': return 'SECONDARY'
        case '#A3239E': return 'ACCENT'
        case '#B2002C': return 'NEGATIVE'
        case '#117C00': return 'POSITIVE'
        default: return hexColor
    }
}

type SectionLayoutProps = {
    label?: string,
    contents: string[],
    isCollapsible?: boolean,
    isInitiallyCollapsed?: boolean,
    divider?: SAILSectionLayoutDivider,
    marginBelow?: SAILMargin,
    labelIcon?: SAILIcon,
    labelSize?: SAILSectionLayoutLabelSize,
    labelColor?: SAILSectionLayoutLabelColor,
    dividerColor?: SAILSectionLayoutDividerColor, 
    marginAbove?: SAILMargin
}

const SectionLayout = ({
    label, contents, isCollapsible, isInitiallyCollapsed, divider, marginBelow, labelIcon, labelSize, labelColor, dividerColor, marginAbove
}: SectionLayoutProps): string[] => {
    const code: string[] = []

    code.push(`a!sectionLayout(`)
    if (label) code.push(`  label: "${label}",`)
    code.push(`  contents: {`)
    code.push(...indentStringArray(contents, 2))
    code.push(`  },`)
    if (isCollapsible) code.push(`  isCollapsible: ${isCollapsible},`)
    if (isInitiallyCollapsed) code.push(`  isInitiallyCollapsed: ${isInitiallyCollapsed},`)
    if (divider) code.push(`  divider: "${divider}",`)
    if (marginBelow) code.push(`  marginBelow: "${marginBelow}",`)
    if (labelIcon) code.push(`  labelIcon: "${labelIcon}",`)
    if (labelSize) code.push(`  labelSize: "${labelSize}",`)
    if (labelColor) code.push(`  labelColor: "${labelColor}",`)
    if (dividerColor) code.push(`  dividerColor: "${dividerColor}",`)
    if (marginAbove) code.push(`  marginAbove: "${marginAbove}"`)
    code.push(`),`)

    return code
}

export const generateSectionLayout = async (instanceNode: InstanceNode, childrenCode: string[]): Promise<string[]> => {
    const props = __getComponentProps(instanceNode)
    const modes = await getAppliedModes(instanceNode)
    const isShowingIcon = props['Show Icon'].value === true ? true : false
    const contentsSlotNode = instanceNode.findOne(child => child.type === 'SLOT' && child.name === 'Contents')
    if (!contentsSlotNode) throw new Error(`Contents slot node not found when trying to generate ${instanceNode.name}`)

    let labelColor: RGB = { r: 1, g: 0, b: 1 }
    const sectionTextNode = instanceNode.findOne(child => child.type === 'TEXT' && child.name === 'Section')
    if (!sectionTextNode) throw new Error(`Section text node not found when trying to generate ${instanceNode.name}`)
    else if (sectionTextNode.type === 'TEXT') {
        labelColor = getLastFillFromNode(sectionTextNode, false)
    }

    let dividerColor: RGBA = { r: 1, g: 0, b: 1, a: 1 }
    if (props['Divider'].value !== 'None' && contentsSlotNode.type === 'SLOT') {
        dividerColor = getLastStrokeFromNode(contentsSlotNode)
    }

    return SectionLayout({
        label: stringProp(props['Label'].value),
        contents: childrenCode, 
        isCollapsible: booleanProp(props['Is Collapsible'].value),
        isInitiallyCollapsed: !booleanProp(props['Is Expanded'].value), 
        divider: mapToSAILSectionLayoutDivider(stringProp(props['Divider'].value)), 
        marginBelow: mapToSAILMargin(stringProp(modes['Margin Below'])), 
        labelIcon: isShowingIcon && isSAILIcon(props['Icon'].value) ? props['Icon'].value : undefined,
        labelSize: mapToSAILSectionLayoutLabelSize(modes['Section Size']), 
        labelColor: mapToSAILSectionLayoutLabelColor(labelColor),
        dividerColor: props['Divider'].value !== 'None' ? mapToSAILSectionLayoutDividerColor(dividerColor) : undefined,
        marginAbove: mapToSAILMargin(stringProp(modes['Margin Above'])), 
    })
}