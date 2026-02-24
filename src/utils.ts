// --- Pure Utility Functions ---

/** Convert a Figma RGB color to a hex string (e.g. "#FF00AA") */
export function rgbToHex(color: RGB): string {
  const r = Math.round(color.r * 255)
  const g = Math.round(color.g * 255)
  const b = Math.round(color.b * 255)
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`
}

/** Indent every line of a code string by the given number of spaces */
export function indentCode(code: string, spaces = 2): string {
  return code.split('\n').map(line => ' '.repeat(spaces) + line).join('\n')
}
