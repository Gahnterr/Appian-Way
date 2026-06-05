export const rgbColorToHexColor = (r: number, g: number, b: number): string => {
    let convertedHexString: string = ''

    const convertDecimalNumberToHexString = (decimalNumber: number): string => {
        let hexString: string = ''
        const convertDecimalToHexDigit = (decimalDigit: number): string => {
            if (decimalDigit >= 0 && decimalDigit <= 15) {
                switch (decimalDigit) {
                case 10: return 'A'
                case 11: return 'B'
                case 12: return 'C'
                case 13: return 'D'
                case 14: return 'E'
                case 15: return 'F'
                default: return decimalDigit.toString()
                }
            } else {
                throw new Error('Input must be a single decimal digit (0-15)')
            }
        }

        let workingNumber = decimalNumber
        do {
            const remainder = workingNumber % 16
            hexString = convertDecimalToHexDigit(remainder) + hexString
            workingNumber = Math.floor(workingNumber / 16)
        } while (workingNumber > 0)
        return hexString
    }

    for (const colorValue of [r, g, b]) {
        if (colorValue >= 0 && colorValue <= 1) {
            const colorValueAs255 = Math.round(colorValue * 255)
            const hexComponent = convertDecimalNumberToHexString(colorValueAs255)
            convertedHexString += hexComponent.length === 1 ? '0' + hexComponent : hexComponent
        } else {
            throw new Error('Color values must be in the range of 0-1')
        }
    }

    convertedHexString = '#' + convertedHexString

    return convertedHexString
}