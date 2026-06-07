import { rgbColorToHexColor } from "../rgbColorToHexColor"

export type SAILTextStyle = 'PLAIN' | 'EMPHASIS' | 'STRONG' | 'UNDERLINE' | 'STRIKETHROUGH'
export const mapToSAILTextStyle = (figmaFontStyle: FontStyle): SAILTextStyle => {
    switch (figmaFontStyle) {
        case 'REGULAR': return 'PLAIN'
        case 'ITALIC': return 'EMPHASIS'
        default: return 'PLAIN'
    }
}

export type SAILTextSize = 'STANDARD' | 'SMALL' | 'MEDIUM' | 'MEDIUM_PLUS' | 'LARGE' | 'LARGE_PLUS' | 'EXTRA_LARGE'
export type SAILTextColor = 'STANDARD' | 'ACCENT' | 'POSITIVE' | 'NEGATIVE' | 'SECONDARY' | string // for capturing Hex code values

export type SAILTextAlign = 'LEFT' | 'CENTER' | 'RIGHT'
export const mapToSAILTextAlignHorizontal = (figmaTextAlignHorizontal: string): SAILTextAlign => {
    switch (figmaTextAlignHorizontal) {
        case 'LEFT': return 'LEFT'
        case 'CENTER': return 'CENTER'
        case 'RIGHT': return 'RIGHT'
        case 'JUSTIFIED': return 'LEFT'
        default: return 'LEFT'
    }
}

export type SAILLabelPosition = 'ABOVE' | 'ADJACENT' | 'COLLAPSED' | 'JUSTIFIED'

export type SAILMargin = "NONE" | "EVEN_LESS" | "LESS" | "STANDARD" | "MORE" | "EVEN_MORE"
export function mapToSAILMargin(figmaMargin: string): SAILMargin
export function mapToSAILMargin(figmaPadding: number): SAILMargin
export function mapToSAILMargin(margin: string | number): SAILMargin {
    if (typeof margin === 'string') {
        switch (margin) {
            case 'None': return 'NONE'
            case 'Even Less': return 'EVEN_LESS'
            case 'Less': return 'LESS'
            case 'Standard': return 'STANDARD'
            case 'More': return 'MORE'
            case 'Even More': return 'EVEN_MORE'
            default: return 'NONE'
        }
    }

    if (margin < 4) return 'NONE'
    if (margin < 7) return 'EVEN_LESS'
    if (margin < 14) return 'LESS'
    if (margin < 28) return 'STANDARD'
    if (margin < 56) return 'MORE'
    return 'EVEN_MORE'
}

export type SAILButtonStyle = 'OUTLINE' | 'GHOST' | 'LINK' | 'SOLID'
export const mapToSAILButtonStyle = (figmaButtonStyle: string): SAILButtonStyle => {
    switch (figmaButtonStyle) {
        case 'Link': return 'LINK'; break
        case 'Outline': return 'OUTLINE'; break
        case 'Solid': return 'SOLID'; break
        default: return 'LINK'; break
    }
}

export type SAILButtonSize = 'SMALL' | 'STANDARD' | 'LARGE'
export const mapToSAILButtonSize = (figmaButtonSize: string): SAILButtonSize => {
    switch (figmaButtonSize) {
        case 'Small': return 'SMALL'; break
        case 'Standard': return 'STANDARD'; break
        case 'Large': return 'LARGE'; break
        default: return 'SMALL'; break
    }
}

export type SAILButtonWidth = 'MINIMIZE' | 'FILL'

export type SAILButtonColor = 'ACCENT' | 'NEGATIVE' | 'POSITIVE' | 'SECONDARY' | string // for capturing Hex code values
export const mapToSAILButtonColor = (figmaButtonColor: string): SAILButtonColor => {
    switch (figmaButtonColor) {
        case 'Primary': return 'ACCENT'; break
        case 'Secondary': return 'SECONDARY'; break
        case 'Negative': return 'NEGATIVE'; break
        case 'Positive': return 'POSITIVE'; break
        default: return 'ACCENT'; break
    }
}

export type SAILButtonArrayLayoutAlign = 'START' | 'CENTER' | 'END'
export const mapToSAILButtonArrayLayoutAlign = (figmaPrimaryAxisAlignItems: string): SAILButtonArrayLayoutAlign => {
    switch (figmaPrimaryAxisAlignItems) {
        case 'MIN': return 'START'
        case 'CENTER': return 'CENTER'
        case 'MAX': return 'END'
        default: return 'START'
    }
}

export type SAILButtonIconPosition = 'START' | 'END'
export const mapToSAILButtonIconPosition = async (figmaButtonIconPosition: string): Promise<SAILButtonIconPosition> => {
    switch (figmaButtonIconPosition) {
        case 'Left': return 'START'; break
        case 'Right': return 'END'; break
        default: return 'START'; break
    }
}

export type SAILCardHeight = 'EXTRA_SHORT' | 'SHORT' | 'SHORT_PLUS' | 'MEDIUM' | 'MEDIUM_PLUS' | 'TALL' | 'TALL_PLUS' | 'EXTRA_TALL' | 'AUTO'
export const mapToSAILCardHeight = (figmaFrameHeight: number | string): SAILCardHeight => {
    if (typeof figmaFrameHeight === 'string') {
        switch (figmaFrameHeight) {
            case 'Auto': return 'AUTO'
            case 'Extra Short': return 'EXTRA_SHORT'
            case 'Short': return 'SHORT'
            case 'Short Plus': return 'SHORT_PLUS'
            case 'Medium': return 'MEDIUM'
            case 'Medium Plus': return 'MEDIUM_PLUS'
            case 'Tall': return 'TALL'
            case 'Tall Plus': return 'TALL_PLUS'
            case 'Extra Tall': return 'EXTRA_TALL'
            default: return 'AUTO'
        }
    }

    if (figmaFrameHeight <= 60) return 'EXTRA_SHORT'
    if (figmaFrameHeight <= 120) return 'SHORT'
    if (figmaFrameHeight <= 180) return 'SHORT_PLUS'
    if (figmaFrameHeight <= 240) return 'MEDIUM'
    if (figmaFrameHeight <= 300) return 'MEDIUM_PLUS'
    if (figmaFrameHeight <= 360) return 'TALL'
    if (figmaFrameHeight <= 480) return 'TALL_PLUS'
    if (figmaFrameHeight <= 600) return 'EXTRA_TALL'
    return 'AUTO'
}

export type SAILCardStyle = 'NONE' | 'TRANSPARENT' | 'STANDARD' | 'ACCENT' | 'SUCCESS' | 'INFO' | 'WARN' | 'ERROR' | string 
export const mapToSAILCardStyle = (figmaCardStyle: string | Paint): SAILCardStyle => {
    if (typeof figmaCardStyle === 'string') {
        switch (figmaCardStyle) {
            case 'None': return 'NONE'
            case 'Transparent': return 'TRANSPARENT'
            case 'Standard': return 'STANDARD'
            case 'Accent': return 'ACCENT'
            case 'Success': return 'SUCCESS'
            case 'Info': return 'INFO'
            case 'Warn': return 'WARN'
            case 'Error': return 'ERROR'
            default: return 'NONE'
        }
    } else if (figmaCardStyle.type === 'SOLID') {
        const { r, g, b } = figmaCardStyle.color
        const hexColor: string = rgbColorToHexColor(r, g, b)
        // TODO: map colors to closest SAIL card style or return hex code if no close match
        return hexColor
    }
    return 'NONE'
}

export type SAILCardShape = 'ROUNDED' | 'SQUARED' | 'SEMI_ROUNDED'
export const mapToSAILCardShape = (figmaCardShape: string): SAILCardShape => {
    switch (figmaCardShape) {
        case 'Rounded': return 'ROUNDED'
        case 'Squared': return 'SQUARED'
        default: return 'SEMI_ROUNDED'
    }
}

export type SAILCardDecorativeBarPosition = 'TOP' | 'BOTTOM' | 'START' | 'END' | 'NONE'
export const mapToSAILCardDecorativeBarPosition = (figmaDecorativeBarPosition: string): SAILCardDecorativeBarPosition => {
    switch (figmaDecorativeBarPosition) {
        case 'Top': return 'TOP'
        case 'Bottom': return 'BOTTOM'
        case 'Start': return 'START'
        case 'End': return 'END'
        default: return 'NONE'
    }
}

export type SAILCardDecorativeBarColor = 'STANDARD' | 'ACCENT' | 'POSITIVE' | 'WARN' | 'NEGATIVE' | 'INFO' | string
export const mapToSAILCardDecorativeBarColor = (figmaDecorativeBarColor: string | Paint): SAILCardDecorativeBarColor => {
    if (typeof figmaDecorativeBarColor === 'string') {
        switch (figmaDecorativeBarColor) {
            case 'Standard': return 'STANDARD'
            case 'Accent': return 'ACCENT'
            case 'Positive': return 'POSITIVE'
            case 'Warn': return 'WARN'
            case 'Negative': return 'NEGATIVE'
            case 'Info': return 'INFO'
            default: return 'STANDARD'
        }
    } else if (figmaDecorativeBarColor.type === 'SOLID') {
        const { r, g, b } = figmaDecorativeBarColor.color
        const hexColor: string = rgbColorToHexColor(r, g, b)
        return hexColor
    }
    return 'STANDARD'
}

export type SAILPadding = 'NONE' | 'EVEN_LESS' | 'LESS' | 'STANDARD' | 'MORE' | 'EVEN_MORE'
export function mapToSAILPadding(figmaPadding: string): SAILPadding
export function mapToSAILPadding(top: number, bottom: number, left: number, right: number): SAILPadding
export function mapToSAILPadding(
    ...args: [string] | [number, number, number, number]
): SAILPadding {
    if (args.length === 1) {
        const [figmaPadding] = args
        switch (figmaPadding) {
            case 'None': return 'NONE'
            case 'Even Less': return 'EVEN_LESS'
            case 'Less': return 'LESS'
            case 'Standard': return 'STANDARD'
            case 'More': return 'MORE'
            case 'Even More': return 'EVEN_MORE'
            default: return 'NONE'
        }
    }

    const [top, bottom, left, right] = args
    const verticalPadding = Math.max(top, bottom)
    const horizontalPadding = Math.max(left, right)
    if (horizontalPadding === 0 && verticalPadding === 0) return 'NONE'
    if (horizontalPadding <= 6 && verticalPadding <= 4) return 'EVEN_LESS'
    if (horizontalPadding <= 12 && verticalPadding <= 8) return 'LESS'
    if (horizontalPadding <= 24 && verticalPadding <= 18) return 'STANDARD'
    if (horizontalPadding <= 32 && verticalPadding <= 32) return 'MORE'
    return 'EVEN_MORE'
}

export type SAILSideBySideItemWidth = 'AUTO' | 'MINIMIZE' | '1X' | '2X' | '3X' | '4X' | '5X' | '6X' | '7X' | '8X' | '9X' | '10X'
export const mapToSAILSideBySideItemWidth = (figmaItemWidth: string): SAILSideBySideItemWidth => {
    if (figmaItemWidth === 'HUG') return 'MINIMIZE'
    else if (figmaItemWidth === 'FILL') return 'AUTO'
    return 'AUTO'
}

export type SAILSideBySideLayoutAlignVertical = 'TOP' | 'MIDDLE' | 'BOTTOM'
export const mapToSAILSideBySideLayoutAlignVertical = (figmaCounterAxisAlignItems: string): SAILSideBySideLayoutAlignVertical => {
    switch (figmaCounterAxisAlignItems) {
        case 'MIN': return 'TOP'
        case 'CENTER': return 'MIDDLE'
        case 'MAX': return 'BOTTOM'
        default: return 'TOP'
    }
}

export type SAILSideBySideLayoutItemSpacing = 'NONE' | 'DENSE' | 'STANDARD' | 'SPARSE'
export const mapToSAILSideBySideLayoutItemSpacing = (figmaItemSpacing: number): SAILSideBySideLayoutItemSpacing => {
    if (figmaItemSpacing === 0) return 'NONE'
    if (figmaItemSpacing <= 3) return 'DENSE'
    if (figmaItemSpacing <= 10) return 'STANDARD'
    else return 'SPARSE'
}

export type SAILRichTextIconSize = 'STANDARD' | 'SMALL' | 'MEDIUM' | 'MEDIUM_PLUS' | 'LARGE' | 'LARGE_PLUS' | 'EXTRA_LARGE'
export const mapToSAILRichTextIconSize = (figmaIconWidth: number): SAILRichTextIconSize => {
    if (figmaIconWidth <= 12) return 'SMALL'
    if (figmaIconWidth <= 14) return 'STANDARD'
    if (figmaIconWidth <= 17) return 'MEDIUM'
    if (figmaIconWidth <= 24) return 'MEDIUM_PLUS'
    if (figmaIconWidth <= 32) return 'LARGE'
    if (figmaIconWidth <= 52) return 'LARGE_PLUS'
    return 'EXTRA_LARGE'
}

export type SAILParagraphHeight = 'SHORT' | 'MEDIUM' | 'TALL'
export type SAILChoiceLayout = 'STACKED' | 'COMPACT'
export type SAILChoiceStyle = 'STANDARD' | 'CARDS'
export type SAILChoiceSpacing = 'STANDARD' | 'MORE' | 'EVEN_MORE'
export type SAILChoicePosition = 'START' | 'END'
export type SAILDropdownSearchDisplay = 'AUTO' | 'ON' | 'OFF'

export type SAILColumnWidth = 'AUTO' | 'EXTRA_NARROW' | 'NARROW' | 'NARROW_PLUS' | 'MEDIUM' | 'MEDIUM_PLUS' | 'WIDE' | 'WIDE_PLUS' | '1X' | '2X' | '3X' | '4X' | '5X' | '6X' | '7X' | '8X' | '9X' | '10X'
export const mapToSAILColumnWidth = (gridColumnTrack: GridTrackSize): SAILColumnWidth => {
    if (gridColumnTrack.type === 'FLEX') {
        const fractionalUnits = Math.min(Math.max(Math.round(gridColumnTrack.value ?? 1), 1), 10)
        return `${fractionalUnits}X` as SAILColumnWidth
    }
    if (gridColumnTrack.type === 'HUG') return 'AUTO'

    const widthInPixels = gridColumnTrack.value ?? 0
    if (widthInPixels <= 60) return 'EXTRA_NARROW'
    if (widthInPixels <= 220) return 'NARROW'
    if (widthInPixels <= 300) return 'NARROW_PLUS'
    if (widthInPixels <= 380) return 'MEDIUM'
    if (widthInPixels <= 540) return 'MEDIUM_PLUS'
    if (widthInPixels <= 780) return 'WIDE'
    return 'WIDE_PLUS'
}

export type SAILColumnsLayoutSpacing = 'NONE' | 'DENSE' | 'STANDARD' | 'SPARSE'
export const mapToSAILColumnsLayoutSpacing = (gridColumnGap: number): SAILColumnsLayoutSpacing => {
    if (gridColumnGap === 0) return 'NONE'
    if (gridColumnGap <= 3) return 'DENSE'
    if (gridColumnGap <= 10) return 'STANDARD'
    return 'SPARSE'
}

export type SAILColumnsLayoutAlignVertical = 'TOP' | 'MIDDLE' | 'BOTTOM'
