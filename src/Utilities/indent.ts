
export const indent = (text: string, indentLevel: number = 1): string[] => {
    const tab = '  '.repeat(indentLevel)

   return text.split('\n').map(textLine => tab + textLine)
}

export const indentStringArray = (textArray: string[], indentLevel: number = 1): string[] => {
    const tab = '  '.repeat(indentLevel)

    return textArray.map(textLine => tab + textLine)
}