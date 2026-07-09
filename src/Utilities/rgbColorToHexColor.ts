export const toHexColor = (r: number, g: number, b: number, a?: number): string => {
    let convertedHexString = ''

    const convertDecimalNumberToHexString = (decimalNumber: number): string => {
        let hexString = ''
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

    let colorValues: number[]
    if (a !== undefined && a >= 0 && a < 1) {
        colorValues = [r, g, b, a]
    }
    else {
        colorValues = [r, g, b]
    }
    for (const [index, colorValue] of colorValues.entries()) {
        if (colorValue >= 0 && colorValue <= 1) {
            const colorValueAs255 = Math.round(colorValue * 255)
            if (index === 3 && colorValueAs255 === 255) continue // skips if alpha is 1 (fully opaque) for a cleaner hex code.
            else {
                const hexComponent = convertDecimalNumberToHexString(colorValueAs255)
                convertedHexString += hexComponent.length === 1 ? '0' + hexComponent : hexComponent
            }
        } else {
            console.log('Color values must be in the range of 0-1')
            console.log('Received the following values:')
            console.log(`r: ${r}, g: ${g}, b: ${b}, a: ${a}`)
        }
    }

    convertedHexString = '#' + convertedHexString

    return convertedHexString
}

export const RGBAToHexColor = (color: RGBA): string => {
    return toHexColor(color.r, color.g, color.b, color.a)
}

export const RGBToHexColor = (color: RGB): string => {
    return toHexColor(color.r, color.g, color.b)
}