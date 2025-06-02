// --- Appian SAIL Component Codegen Blueprints & Logic ---

// --- buttonWidget ---
function buttonWidget(props: {
  label?: string,
  icon?: string,
  iconPosition?: string,
  style?: string,
  size?: string,
  color?: string,
  tooltip?: string,
  disabled?: boolean
}): string {
  // Blueprint for all possible props
  const sailProps: string[] = []
  if (props.label) sailProps.push(`label: "${props.label}"`)
  if (props.icon) sailProps.push(`icon: "${props.icon}"`)
  if (props.iconPosition) sailProps.push(`iconPosition: "${props.iconPosition}"`)
  if (props.style) sailProps.push(`style: "${props.style}"`)
  if (props.size) sailProps.push(`size: "${props.size}"`)
  if (props.color) sailProps.push(`color: "${props.color}"`)
  if (props.tooltip) sailProps.push(`tooltip: "${props.tooltip}"`)
  if (props.disabled) sailProps.push(`disabled: true`)
  return `a!buttonWidget(
  ${sailProps.join(',\n  ')}
)`
}

// --- buttonArrayLayout ---
function buttonArrayLayout(props: {
  buttons: string[],
  align?: string,
  marginAbove?: string,
  marginBelow?: string
}): string {
  // All possible props for buttonArrayLayout
  const sailProps: string[] = [
    `buttons: {\n    ${props.buttons.join(',\n    ')}\n  }`
  ]
  if (props.align) sailProps.push(`align: "${props.align}"`)
  if (props.marginAbove) sailProps.push(`marginAbove: "${props.marginAbove}"`)
  sailProps.push(`marginBelow: "${props.marginBelow ?? 'NONE'}"`)
  return `a!buttonArrayLayout(
  ${sailProps.join(',\n  ')}
)`
}

// --- sideBySideItem ---
function sideBySideItem(props: { item: string }): string {
  return `a!sideBySideItem(
  item: ${props.item}
)`
}

// --- sideBySideLayout ---
function sideBySideLayout(props: { items: string[] }): string {
  return `a!sideBySideLayout(
  items: {
${props.items.map(i => indentCode(i, 4)).join(',\n')}
  }
)`
}

// --- richTextDisplayField ---
function richTextDisplayField(props: {
  value: string,
  marginAbove?: string,
  marginBelow?: string
}): string {
  // All possible props for richTextDisplayField
  const sailProps: string[] = [
    `labelPosition: "COLLAPSED"`,
    `value: {\n    "${props.value.replace(/"/g, '\\"')}"\n  }`
  ]
  if (props.marginAbove) sailProps.push(`marginAbove: "${props.marginAbove}"`)
  if (props.marginBelow) sailProps.push(`marginBelow: "${props.marginBelow}"`)
  return `a!richTextDisplayField(
  ${sailProps.join(',\n  ')}
)`
}

// --- cardLayout ---
function cardLayout(props: {
  padding?: string,
  marginBelow?: string,
  marginAbove?: string,
  shape?: string,
  style?: string,
  borderColor?: string,
  showBorder?: boolean,
  showShadow?: boolean,
  contents?: string[]
}): string {
  // All possible props for cardLayout
  const sailProps: string[] = []
  if (props.padding) sailProps.push(`padding: "${props.padding}"`)
  if (props.marginAbove) sailProps.push(`marginAbove: "${props.marginAbove}"`)
  sailProps.push(`marginBelow: "${props.marginBelow ?? 'NONE'}"`)
  if (props.shape) sailProps.push(`shape: "${props.shape}"`)
  if (props.style) sailProps.push(`style: "${props.style}"`)
  if (props.borderColor) sailProps.push(`borderColor: "${props.borderColor}"`)
  sailProps.push(`showBorder: ${props.showBorder ? 'true' : 'false'}`)
  if (props.showShadow) sailProps.push(`showShadow: true`)
  if (props.contents && props.contents.length > 0) {
    sailProps.push(`contents: {${props.contents.map(c => '\n' + indentCode(c, 2)).join(',')}\n  }`)
  }
  return `a!cardLayout(
  ${sailProps.join(',\n  ')}
)`
}

// --- Utility Functions ---

function rgbToHex(color: RGB): string {
  const r = Math.round(color.r * 255)
  const g = Math.round(color.g * 255)
  const b = Math.round(color.b * 255)
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`
}

function indentCode(code: string, spaces = 2): string {
  return code.split('\n').map(line => ' '.repeat(spaces) + line).join('\n')
}

// --- Helper Functions for Node Analysis ---

async function getAppliedVariableModes(node: InstanceNode): Promise<Record<string, string>> {
  const result: Record<string, string> = {}
  const appliedModes = node.resolvedVariableModes || {}
  for (const collectionId in appliedModes) {
    const modeId = appliedModes[collectionId]
    const collection = await figma.variables.getVariableCollectionByIdAsync(collectionId)
    if (!collection) continue
    const collectionName = collection.name
    const mode = collection.modes.find(m => m.modeId === modeId)
    if (mode && collectionName) {
      result[collectionName] = mode.name
    }
  }
  return result
}

function getComponentPropsMap(props: Record<string, any>): Record<string, string> {
  const result: Record<string, string> = {}
  for (const key in props) {
    // Use the visible label if available, else fallback to key
    const label = props[key].name || key
    result[label] = props[key].value?.toString?.() ?? ''
  }
  return result
}

function isCardLayoutFrame(node: FrameNode): boolean {
  const hasFill = Array.isArray(node.fills) && node.fills.length > 0 && node.fills[0].type === 'SOLID' && node.fills[0].opacity !== 0
  const hasStroke = Array.isArray(node.strokes) && node.strokes.length > 0 && node.strokes[0].type === 'SOLID'
  return hasFill || hasStroke
}

function isSideBySideLayoutCode(code: string): boolean {
  return /^\s*a!sideBySideLayout\s*\(/.test(code)
}

function isCardLayoutCode(code: string): boolean {
  return /^\s*a!cardLayout\s*\(/.test(code)
}

// --- Appian Component Codegen Logic ---

// --- Button ---
async function generateButtonSAIL(node: InstanceNode): Promise<string> {
  const props = node.componentProperties || {}
  const propMap = getComponentPropsMap(props)
  const variableModes = await getAppliedVariableModes(node)

  const label = propMap['Label#614:146'] || ''
  const iconPosition = propMap['Icon Position'] || ''
  let iconName = 'ICON_NAME' // Replace or extract as needed
  let iconInstanceName = ''
  // Find the icon instance swap prop by searching for a prop whose type is INSTANCE_SWAP and label includes "icon"
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
  let sailProps: { key: string, value: string }[] = []
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
        sailProps.push({ key: 'tooltip', value: `"${tooltipLabel}"`})
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

// --- Button Array Layout ---
function generateButtonArrayLayout(buttons: string[], align?: string, marginAbove?: string, marginBelow?: string): string {
  return buttonArrayLayout({
    buttons,
    align,
    marginAbove,
    marginBelow
  })
}

// --- SideBySide Layout ---
function generateSideBySideLayout(items: string[]): string {
  return sideBySideLayout({ items })
}

// --- SideBySide Item ---
function generateSideBySideItem(item: string): string {
  return sideBySideItem({ item })
}

// --- Rich Text Display Field ---
function generateRichTextDisplayField(value: string, marginAbove?: string, marginBelow?: string): string {
  return richTextDisplayField({ value, marginAbove, marginBelow })
}

// --- Card Layout ---
async function generateCardLayoutSAIL(node: FrameNode, contents: string[] = []): Promise<string> {
  // --- Special case: horizontal autolayout with only buttons -> buttonArrayLayout ---
  if (
    node.layoutMode === 'HORIZONTAL' &&
    Array.isArray(node.children) &&
    node.children.length > 0
  ) {
    // Gather all children SAIL results
    const childResults = await Promise.all(node.children.map(child => generateSAILForNode(child)))
    // Check if all children are button objects (from generateSAILForNode)
    const allButtons = childResults.every(
      cr => cr && typeof cr === 'object' && cr.type === 'button'
    )
    if (allButtons) {
      const buttonCodes = childResults.map(cr => (cr as { code: string }).code)
      // Alignment detection
      let alignProp = ''
      if (node.primaryAxisAlignItems === 'MAX') {
        alignProp = ',\n  align: "END"'
      } else if (node.primaryAxisAlignItems === 'CENTER') {
        alignProp = ',\n  align: "CENTER"'
      }
      return `a!buttonArrayLayout(
  buttons: {
    ${buttonCodes.join(',\n    ')}
  }${alignProp},
  marginBelow: "NONE"
)`
    }
  }

  // --- SideBySideLayout for horizontal autolayout with no fill/stroke ---
  if (
    node.layoutMode === 'HORIZONTAL' &&
    !isCardLayoutFrame(node) &&
    Array.isArray(node.children)
  ) {
    // Only sideBySideLayout, not cardLayout
    // Only use sideBySideLayout if none of the children are cardLayouts or sideBySideLayouts
    let hasCardChildOrSideBySide = false
    const itemBlocks = await Promise.all(
      node.children.map(async (child) => {
        if (child.type === 'FRAME' && isCardLayoutFrame(child)) {
          hasCardChildOrSideBySide = true
        }
        const childResult = await generateSAILForNode(child)
        if (typeof childResult === 'string' && childResult.trim()) {
          if (isCardLayoutCode(childResult) || isSideBySideLayoutCode(childResult)) {
            hasCardChildOrSideBySide = true
            return null
          }
          return `a!sideBySideItem(
  item: ${childResult}
)`
        }
        if (childResult && typeof childResult === 'object' && childResult.type === 'button') {
          return `a!sideBySideItem(
  item: ${childResult.code}
)`
        }
        return null
      })
    )
    if (!hasCardChildOrSideBySide) {
      const filteredItems = itemBlocks.filter(Boolean)
      return `a!sideBySideLayout(
  items: {
${filteredItems.filter((i): i is string => i !== null).map(i => indentCode(i, 4)).join(',\n')}
  }
)`
    }
    // If any child is a card or sideBySide, fall through to cardLayout logic below
  }

  // --- Padding and margin mapping logic ---
  let paddingValue: string | undefined = undefined
  let marginAboveValue: string | undefined = undefined
  let marginBelowValue: string | undefined = undefined

  if (node.layoutMode && node.layoutMode !== 'NONE') {
    const hasLeft = typeof node.paddingLeft === 'number' && node.paddingLeft > 0
    const hasRight = typeof node.paddingRight === 'number' && node.paddingRight > 0
    const hasTop = typeof node.paddingTop === 'number' && node.paddingTop > 0
    const hasBottom = typeof node.paddingBottom === 'number' && node.paddingBottom > 0

    function mapPadding(val: number): string {
      if (val >= 33) return 'EVEN_MORE'
      if (val >= 25) return 'MORE'
      if (val >= 13) return 'STANDARD'
      if (val >= 7) return 'LESS'
      if (val >= 1) return 'EVEN_LESS'
      return 'NONE'
    }
    function mapMargin(val: number): string {
      if (val >= 29) return 'EVEN_MORE'
      if (val >= 15) return 'MORE'
      if (val >= 8) return 'STANDARD'
      if (val >= 5) return 'LESS'
      if (val >= 1) return 'EVEN_LESS'
      return 'NONE'
    }

    if (hasLeft) {
      paddingValue = mapPadding(node.paddingLeft)
    } else if (hasRight) {
      paddingValue = mapPadding(node.paddingRight)
    } else if (hasTop || hasBottom) {
      marginAboveValue = hasTop ? mapMargin(node.paddingTop) : undefined
      marginBelowValue = hasBottom ? mapMargin(node.paddingBottom) : undefined
    } else {
      paddingValue = 'NONE'
    }
  } else {
    paddingValue = 'NONE'
  }

  // --- Apply marginAbove/marginBelow to supported children if needed ---
  let finalContents = contents
  if ((marginAboveValue || marginBelowValue) && contents.length > 0) {
    finalContents = contents.map(content => {
      // Only works for a!buttonArrayLayout and a!richTextDisplayField
      if (/^a!buttonArrayLayout\(/.test(content)) {
        let updated = content.replace(
          /\bmarginBelow:\s*"NONE"/,
          marginBelowValue ? `marginBelow: "${marginBelowValue}"` : 'marginBelow: "NONE"'
        )
        if (marginAboveValue) {
          updated = updated.replace(
            /^a!buttonArrayLayout\(/,
            `a!buttonArrayLayout(\n  marginAbove: "${marginAboveValue}",`
          )
        }
        return updated
      }
      if (/^a!richTextDisplayField\(/.test(content)) {
        let updated = content
        if (marginAboveValue) {
          updated = updated.replace(
            /^a!richTextDisplayField\(/,
            `a!richTextDisplayField(\n  marginAbove: "${marginAboveValue}",`
          )
        }
        if (marginBelowValue) {
          updated = updated.replace(
            /\)$/,
            `,\n  marginBelow: "${marginBelowValue}"\n)`
          )
        }
        return updated
      }
      return content
    })
  }

  // --- Card layout visual props ---
  let shapeValue = ''
  if (typeof node.cornerRadius === 'number') {
    if (node.cornerRadius === 0) shapeValue = 'SQUARED'
    else if (node.cornerRadius === 4) shapeValue = 'SEMI_ROUNDED'
    else if (node.cornerRadius === 8) shapeValue = 'ROUNDED'
  }
  let styleValue = 'TRANSPARENT'
  if (node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
    const fill = node.fills[0]
    if (fill.type === 'SOLID' && fill.opacity !== 0) {
      styleValue = rgbToHex(fill.color)
    }
  }
  let borderColor: string | undefined = undefined
  let showBorder = false
  if (node.strokes && Array.isArray(node.strokes) && node.strokes.length > 0) {
    showBorder = true
    const stroke = node.strokes[0]
    if (stroke.type === 'SOLID') {
      borderColor = rgbToHex(stroke.color)
    }
  }
  let showShadow = false
  if (node.effects && node.effects.some(e => e.type === 'DROP_SHADOW' && e.visible !== false)) {
    showShadow = true
  }

  // Compose cardLayout
  return cardLayout({
    padding: paddingValue,
    marginAbove: marginAboveValue,
    marginBelow: marginBelowValue,
    shape: shapeValue || undefined,
    style: styleValue,
    borderColor,
    showBorder,
    showShadow,
    contents: finalContents
  })
}

// --- Main Recursive Codegen Logic ---

type SAILNodeResult = string | { type: string; code: string }

async function generateSAILForNode(node: BaseNode): Promise<SAILNodeResult> {
  // --- Button ---
  if (node.type === 'INSTANCE') {
    const mainComponent = await node.getMainComponentAsync()
    if (
      mainComponent &&
      mainComponent.parent &&
      mainComponent.parent.type === 'COMPONENT_SET'
    ) {
      switch (mainComponent.parent.name) {
        case 'Button':
          return { type: 'button', code: await generateButtonSAIL(node) }
      }
    }
  }

  // --- Rich Text ---
  if (node.type === 'TEXT') {
    let textValue = ''
    if ('characters' in node && typeof node.characters === 'string') {
      textValue = node.characters
    }
    return generateRichTextDisplayField(textValue)
  }

  // --- Frame/Card Layout ---
  if (node.type === 'FRAME') {
    let contents: string[] = []
    let buttonAlign: string | undefined

    // --- AutoLayout alignment detection for buttonArrayLayout ---
    if (node.layoutMode && node.layoutMode !== 'NONE') {
      if (node.layoutMode === 'HORIZONTAL') {
        if (node.primaryAxisAlignItems === 'MAX') {
          buttonAlign = 'END'
        } else if (node.primaryAxisAlignItems === 'CENTER') {
          buttonAlign = 'CENTER'
        }
      }
      if (node.layoutMode === 'VERTICAL') {
        if (node.counterAxisAlignItems === 'MAX') {
          buttonAlign = 'END'
        } else if (node.counterAxisAlignItems === 'CENTER') {
          buttonAlign = 'CENTER'
        }
      }
    }

    if ('children' in node && Array.isArray(node.children)) {
      let buffer: string[] = []
      for (const child of node.children) {
        const childResult = await generateSAILForNode(child)
        if (childResult && typeof childResult === 'object' && childResult.type === 'button') {
          buffer.push(childResult.code)
        } else {
          if (buffer.length > 0) {
            contents.push(generateButtonArrayLayout(buffer, buttonAlign))
            buffer = []
          }
          if (childResult && typeof childResult === 'string' && childResult.trim()) {
            contents.push(childResult)
          }
        }
      }
      if (buffer.length > 0) {
        contents.push(generateButtonArrayLayout(buffer, buttonAlign))
      }
    }
    return await generateCardLayoutSAIL(node, contents)
  }

  // --- Unrecognized node ---
  return ''
}

// --- Main Entrypoint ---

figma.codegen.on('generate', async (event) => {
  const node = event.node
  const codeResult = await generateSAILForNode(node)
  let codeString: string
  if (typeof codeResult === 'string') {
    codeString = codeResult
  } else if (codeResult && typeof codeResult === 'object' && 'code' in codeResult) {
    codeString = codeResult.code
  } else {
    codeString = ''
  }
  return [
    {
      language: 'JAVASCRIPT',
      code: codeString || '// Select a supported SAIL component.',
      title: 'SAIL Code',
    },
  ]
})

