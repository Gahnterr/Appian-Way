// --- SAIL Component Template Builders ---
//
// Each function produces a SAIL code string from a props object.
// These are pure string generators with no Figma API dependencies.

import { indentCode } from './utils'

// --- buttonWidget ---
export function buttonWidget(props: {
  label?: string,
  icon?: string,
  iconPosition?: string,
  style?: string,
  size?: string,
  color?: string,
  tooltip?: string,
  disabled?: boolean
}): string {
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
export function buttonArrayLayout(props: {
  buttons: string[],
  align?: string,
  marginAbove?: string,
  marginBelow?: string
}): string {
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
export function sideBySideItem(props: { 
  item: string,
  width?: string
}): string {
  const sailProps: string[] = [`item: ${props.item}`]
  if (props.width) sailProps.push(`width: "${props.width}"`)
  return `a!sideBySideItem(
  ${sailProps.join(',\n  ')}
)`
}

// --- sideBySideLayout ---
export function sideBySideLayout(props: { 
  items: string[],
  spacing?: string,
  alignVertical?: string
}): string {
  const sailProps: string[] = []
  sailProps.push(`items: {\n${props.items.map(i => indentCode(i, 4)).join(',\n')}\n  }`)
  if (props.spacing) sailProps.push(`spacing: "${props.spacing}"`)
  if (props.alignVertical) sailProps.push(`alignVertical: "${props.alignVertical}"`)
  return `a!sideBySideLayout(
  ${sailProps.join(',\n  ')}
)`
}

// --- columnLayout ---
export function columnLayout(props: { 
  contents: string[],
  width?: string
}): string {
  const sailProps: string[] = []
  if (props.contents && props.contents.length > 0) {
    sailProps.push(`contents: {${props.contents.map(c => '\n' + indentCode(c, 4)).join(',')}\n  }`)
  }
  if (props.width) sailProps.push(`width: "${props.width}"`)
  return `a!columnLayout(
  ${sailProps.join(',\n  ')}
)`
}

// --- columnsLayout ---
export function columnsLayout(props: { 
  columns: string[],
  spacing?: string,
  alignVertical?: string
}): string {
  const sailProps: string[] = []
  sailProps.push(`columns: {\n${props.columns.map(c => indentCode(c, 4)).join(',\n')}\n  }`)
  if (props.spacing) sailProps.push(`spacing: "${props.spacing}"`)
  if (props.alignVertical) sailProps.push(`alignVertical: "${props.alignVertical}"`)
  return `a!columnsLayout(
  ${sailProps.join(',\n  ')}
)`
}

// --- richTextItem ---
export function richTextItem(props: {
  text: string,
  size?: string,
  style?: string | string[],
  color?: string,
}): string {
  const sailProps: string[] = []
  sailProps.push(`text: "${props.text.replace(/"/g, '\\"')}"`)
  if (props.size) sailProps.push(`size: "${props.size}"`)
  if (props.style) {
    if (Array.isArray(props.style)) {
      if (props.style.length === 1) {
        sailProps.push(`style: "${props.style[0]}"`)
      } else {
        sailProps.push(`style: { ${props.style.map(s => `"${s}"`).join(', ')} }`)
      }
    } else {
      sailProps.push(`style: "${props.style}"`)
    }
  }
  if (props.color) sailProps.push(`color: "${props.color}"`)
  return `a!richTextItem(
  ${sailProps.join(',\n  ')}
)`
}

// --- richTextIcon ---
export function richTextIcon(props: {
  icon: string,
  size?: string,
  color?: string,
  altText?: string,
}): string {
  const sailProps: string[] = []
  sailProps.push(`icon: "${props.icon}"`)
  if (props.size) sailProps.push(`size: "${props.size}"`)
  if (props.color) sailProps.push(`color: "${props.color}"`)
  if (props.altText) sailProps.push(`altText: "${props.altText.replace(/"/g, '\\"')}"`)
  return `a!richTextIcon(
  ${sailProps.join(',\n  ')}
)`
}

// --- richTextDisplayField ---
export function richTextDisplayField(props: {
  items: string[],
  marginAbove?: string,
  marginBelow?: string
}): string {
  const sailProps: string[] = [
    `labelPosition: "COLLAPSED"`,
  ]
  if (props.items.length === 1) {
    sailProps.push(`value: {\n${indentCode(props.items[0], 4)}\n  }`)
  } else {
    sailProps.push(`value: {\n${props.items.map(item => indentCode(item, 4)).join(',\n')}\n  }`)
  }
  if (props.marginAbove) sailProps.push(`marginAbove: "${props.marginAbove}"`)
  if (props.marginBelow) sailProps.push(`marginBelow: "${props.marginBelow}"`)
  return `a!richTextDisplayField(
  ${sailProps.join(',\n  ')}
)`
}

// --- cardLayout ---
export function cardLayout(props: {
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

// --- headingField ---
export function headingField(props: {
  text: string,
  size?: string,
  decoration?: string | string[],
}): string {
  const sailProps: string[] = []
  sailProps.push(`text: "${props.text.replace(/"/g, '\\"')}"`)
  if (props.size) sailProps.push(`size: "${props.size}"`)
  if (props.decoration) {
    if (Array.isArray(props.decoration)) {
      if (props.decoration.length === 1) {
        sailProps.push(`decoration: "${props.decoration[0]}"`)
      } else {
        sailProps.push(`decoration: { ${props.decoration.map(d => `"${d}"`).join(', ')} }`)
      }
    } else {
      sailProps.push(`decoration: "${props.decoration}"`)
    }
  }
  return `a!headingField(
  ${sailProps.join(',\n  ')}
)`
}

// --- imageField ---
export function imageField(props: {
  altText?: string,
  size?: string,
}): string {
  const sailProps: string[] = [
    `labelPosition: "COLLAPSED"`,
    `images: {
    a!documentImage(
      document: a!EXAMPLE_DOCUMENT_IMAGE(),
      altText: "${(props.altText ?? 'image').replace(/"/g, '\\"')}"
    )
  }`
  ]
  if (props.size) sailProps.push(`size: "${props.size}"`)
  return `a!imageField(
  ${sailProps.join(',\n  ')}
)`
}

// --- Convenience Wrappers ---

export function generateButtonArrayLayout(buttons: string[], align?: string, marginAbove?: string, marginBelow?: string): string {
  return buttonArrayLayout({ buttons, align, marginAbove, marginBelow })
}

export function generateSideBySideLayout(items: string[]): string {
  return sideBySideLayout({ items })
}

export function generateSideBySideItem(item: string): string {
  return sideBySideItem({ item })
}
