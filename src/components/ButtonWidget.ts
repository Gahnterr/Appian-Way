// --- Button Component ---
//
// Generates SAIL code for an Appian Button (a!buttonWidget).
// Runs when the selected node is an INSTANCE whose parent component set is "Button".
// Handles: label, icon, icon position, style, size, color, tooltip, disabled state.

import { getAppliedVariableModes, getComponentPropsMap } from '../helpers'
import { buttonWidget } from '../templates'

export async function generateButtonSAIL(node: InstanceNode): Promise<string> {
  const props = node.componentProperties || {}
  const propMap = getComponentPropsMap(props)
  const variableModes = await getAppliedVariableModes(node)

  const label = propMap['Label#614:146'] || ''
  const iconPosition = propMap['Icon Position'] || ''
  let iconInstanceName = ''

  // Find the icon instance swap prop by searching for a prop whose type is
  // INSTANCE_SWAP and label includes "icon"
  for (const key in props) {
    if (props[key].type === 'INSTANCE_SWAP' && key.toLowerCase().includes('icon')) {
      const swappedNodeId = props[key].value?.toString?.() ?? ''
      if (swappedNodeId) {
        const swappedNode = await figma.getNodeByIdAsync(swappedNodeId)
        if (swappedNode && 'name' in swappedNode) {
          iconInstanceName = swappedNode.name
        } else {
          iconInstanceName = swappedNodeId // fallback to ID if name not found
        }
      }
      break
    }
  }

  // Map icon position and label to SAIL props
  const sailProps: { key: string, value: string }[] = []
  switch (iconPosition) {
    case 'Left':
      if (label) sailProps.push({ key: 'label', value: `"${label}"` })
      if (iconInstanceName) sailProps.push({ key: 'icon', value: `"${iconInstanceName}"` })
      sailProps.push({ key: 'iconPosition', value: `"START"` })
      break
    case 'Right':
      if (label) sailProps.push({ key: 'label', value: `"${label}"` })
      if (iconInstanceName) sailProps.push({ key: 'icon', value: `"${iconInstanceName}"` })
      sailProps.push({ key: 'iconPosition', value: `"END"` })
      break
    case 'Icon Only':
      if (iconInstanceName) sailProps.push({ key: 'icon', value: `"${iconInstanceName}"` })
      break
    case 'Text Only':
      if (label) sailProps.push({ key: 'label', value: `"${label}"` })
      break
    default:
      if (label) sailProps.push({ key: 'label', value: `"${label}"` })
      break
  }

  // Map variable modes to SAIL props
  if (variableModes['Btn Style']) {
    const styleMap: Record<string, string> = {
      'Link': 'LINK',
      'Outline': 'OUTLINE',
      'Solid': 'SOLID'
    }
    const btnStyle = styleMap[variableModes['Btn Style']]
    if (btnStyle) sailProps.push({ key: 'style', value: `"${btnStyle}"` })
  }
  if (variableModes['Btn Size']) {
    const sizeMap: Record<string, string> = {
      'Small': 'SMALL',
      'Standard': 'STANDARD',
      'Large': 'LARGE'
    }
    const btnSize = sizeMap[variableModes['Btn Size']]
    if (btnSize) sailProps.push({ key: 'size', value: `"${btnSize}"` })
  }
  if (variableModes['Color Style']) {
    const colorMap: Record<string, string> = {
      'Primary': 'ACCENT',
      'Negative': 'NEGATIVE',
      'Positive': '#138A00'
    }
    const colorStyle = colorMap[variableModes['Color Style']]
    if (colorStyle) sailProps.push({ key: 'color', value: `"${colorStyle}"` })
  }

  // Check for tooltip
  let tooltipLabel = ''
  if (propMap['Has Tooltip#3239:0'] === 'true') {
    // Find the nested instance node (tooltip)
    if ('children' in node && Array.isArray(node.children)) {
      const tooltipInstance = node.children.find(child => child.type === 'INSTANCE')
      if (tooltipInstance && 'componentProperties' in tooltipInstance) {
        const tooltipProps = getComponentPropsMap(tooltipInstance.componentProperties)
        tooltipLabel = tooltipProps['Label#781:6'] || ''
        sailProps.push({ key: 'tooltip', value: `"${tooltipLabel}"` })
      }
    }
  }

  // Check for "State" prop and handle "Disabled"
  if (propMap['State'] === 'Disabled') {
    sailProps.push({ key: 'disabled', value: 'true' })
  }

  // Compose props for buttonWidget
  return buttonWidget({
    label,
    icon: iconInstanceName || undefined,
    iconPosition: iconPosition === 'Left' ? 'START' : iconPosition === 'Right' ? 'END' : undefined,
    style: variableModes['Btn Style'] ? { 'Link': 'LINK', 'Outline': 'OUTLINE', 'Solid': 'SOLID' }[variableModes['Btn Style']] : undefined,
    size: variableModes['Btn Size'] ? { 'Small': 'SMALL', 'Standard': 'STANDARD', 'Large': 'LARGE' }[variableModes['Btn Size']] : undefined,
    color: variableModes['Color Style'] ? { 'Primary': 'ACCENT', 'Negative': 'NEGATIVE', 'Positive': '#138A00' }[variableModes['Color Style']] : undefined,
    tooltip: tooltipLabel || undefined,
    disabled: propMap['State'] === 'Disabled'
  })
}
