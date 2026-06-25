import { toHexColor } from "../Utilities/rgbColorToHexColor"

export type SAILTextStyle = 'PLAIN' | 'EMPHASIS' | 'STRONG' | 'UNDERLINE' | 'STRIKETHROUGH'
export const mapToSAILTextStyle = (figmaFontStyle: FontStyle): SAILTextStyle => {
    switch (figmaFontStyle) {
        case 'REGULAR': return 'PLAIN'
        case 'ITALIC': return 'EMPHASIS'
        default: return 'PLAIN'
    }
}

export type SAILTextSize = 'STANDARD' | 'SMALL' | 'MEDIUM' | 'MEDIUM_PLUS' | 'LARGE' | 'LARGE_PLUS' | 'EXTRA_LARGE'
export const mapToSAILTextSize = (size: number): SAILTextSize => {
    if (size <= 12) return 'SMALL'
    else if (size <= 14) return 'STANDARD'
    else if (size <= 17) return 'MEDIUM'
    else if (size <= 24) return 'MEDIUM_PLUS'
    else if (size <= 32) return 'LARGE'
    else if (size <= 52) return 'LARGE_PLUS'
    return 'EXTRA_LARGE'
}

export type SAILRichTextColor = 'STANDARD' | 'ACCENT' | 'POSITIVE' | 'NEGATIVE' | 'SECONDARY' | string 
export const mapToSAILRichTextColor = (instanceNode: InstanceNode): SAILRichTextColor => { 
    let richTextColor: SAILRichTextColor = 'STANDARD'

    if (instanceNode.type === 'INSTANCE') {
        const vectorLayer: VectorNode = instanceNode.findChild(child => child.type === 'VECTOR') as VectorNode
        const colors: RGB[] = vectorLayer?.fills !== figma.mixed ? vectorLayer?.fills.map(fill => fill.type === 'SOLID' && fill.color) as RGB[] : []
        const color: RGB = colors[colors.length - 1]
        richTextColor = toHexColor(color.r, color.g, color.b)
    } else throw new Error(`Did not pass an instance node during mapToSAILRichTextColor. Node that caused the error: ${instanceNode.id}`)
    return richTextColor
}

export type SAILTextAlign = 'LEFT' | 'CENTER' | 'RIGHT'
export const mapToSAILTextAlign = (figmaTextAlignHorizontal: string): SAILTextAlign => {
    switch (figmaTextAlignHorizontal) {
        case 'LEFT': return 'LEFT'
        case 'CENTER': return 'CENTER'
        case 'RIGHT': return 'RIGHT'
        case 'JUSTIFIED': return 'LEFT'
        default: return 'LEFT'
    }
}

export type SAILLabelPosition = 'ABOVE' | 'ADJACENT' | 'COLLAPSED' | 'JUSTIFIED'
export const mapToSAILLabelPosition = (figmaLabelPosition: string): SAILLabelPosition => {
    switch (figmaLabelPosition) {
        case 'Above': return 'ABOVE'
        case 'Adjacent': return 'ADJACENT'
        case 'Collapsed': return 'COLLAPSED'
        case 'Hidden': return 'COLLAPSED'
        case 'Justified': return 'JUSTIFIED'
        default: return 'COLLAPSED'
    }
}

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
        const opacity = figmaCardStyle.opacity
        const hexColor: string = toHexColor(r, g, b, opacity)
        // TODO: map colors to closest SAIL card style or return hex code if no close match
        return hexColor
    }
    return 'NONE'
}

export type SAILCardShape = 'ROUNDED' | 'SQUARED' | 'SEMI_ROUNDED'
export const mapToSAILCardShape = (figmaCardShape: string | number): SAILCardShape => {
    if (typeof figmaCardShape === 'string') {
        switch (figmaCardShape) {
            case 'Rounded': return 'ROUNDED'
            case 'Squared': return 'SQUARED'
            default: return 'ROUNDED'
        }
    } 
    if (figmaCardShape === 0) return 'SQUARED'
    if (figmaCardShape < 8) return 'SEMI_ROUNDED'
    return 'ROUNDED'
}

export type SAILCardDecorativeBarPosition = 'TOP' | 'BOTTOM' | 'START' | 'END' | 'NONE'
export const mapToSAILCardDecorativeBarPosition = (figmaDecorativeBarPosition: string): SAILCardDecorativeBarPosition => {
    switch (figmaDecorativeBarPosition) {
        case 'Top': return 'TOP'
        case 'Bottom': return 'BOTTOM'
        case 'Left': return 'START'
        case 'Right': return 'END'
        default: return 'NONE'
    }
}

export type SAILCardDecorativeBarColor = 'ACCENT' | 'POSITIVE' | 'WARN' | 'NEGATIVE' | 'INFO' | string
export const mapToSAILCardDecorativeBarColor = (figmaDecorativeBarColor: string | Paint): SAILCardDecorativeBarColor => {
    if (typeof figmaDecorativeBarColor === 'string') {
        switch (figmaDecorativeBarColor) {
            case 'Accent': return 'ACCENT'
            case 'Positive': return 'POSITIVE'
            case 'Warn': return 'WARN'
            case 'Negative': return 'NEGATIVE'
            case 'Info': return 'INFO'
            default: return 'ACCENT'
        }
    } else if (figmaDecorativeBarColor.type === 'SOLID') {
        const { r, g, b } = figmaDecorativeBarColor.color
        const hexColor: string = toHexColor(r, g, b)
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
    if (figmaItemWidth === 'HUG' || figmaItemWidth === 'FIXED') return 'MINIMIZE'
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
export const mapToSAILParagraphHeight = (figmaParagraphHeight: string): SAILParagraphHeight => {
    switch (figmaParagraphHeight) {
        case 'Short': return 'SHORT'
        case 'Medium': return 'MEDIUM'
        case 'Tall': return 'TALL'
        default: return 'SHORT'
    }
}

export type SAILChoiceLayout = 'STACKED' | 'COMPACT'
export const mapToSAILChoiceLayout = (figmaChoiceLayout: string): SAILChoiceLayout => {
    switch (figmaChoiceLayout) {
        case 'Stacked': return 'STACKED'
        case 'Compact': return 'COMPACT'
        default: return 'COMPACT'
    }
}

export type SAILChoiceStyle = 'STANDARD' | 'CARDS'
export const mapToSAILChoiceStyle = (figmaChoiceStyle: string): SAILChoiceStyle => {
    switch (figmaChoiceStyle) {
        case 'Standard': return 'STANDARD'
        case 'Cards': return 'CARDS'
        default: return 'STANDARD'
    }
}

export type SAILChoiceSpacing = 'STANDARD' | 'MORE' | 'EVEN_MORE'
export const mapToSAILChoiceSpacing = (figmaChoiceSpacing: string): SAILChoiceSpacing => {
    switch (figmaChoiceSpacing) {
        case 'Standard': return 'STANDARD'
        case 'More': return 'MORE'
        case 'Even More': return 'EVEN_MORE'
        default: return 'STANDARD'
    }
}

export type SAILChoicePosition = 'START' | 'END'
export const mapToSAILChoicePosition = (figmaChoicePosition: string): SAILChoicePosition => {
    switch (figmaChoicePosition) {
        case 'Start': return 'START'
        case 'End': return 'END'
        default: return 'START'
    }
}

export type SAILDropdownSearchDisplay = 'AUTO' | 'ON' | 'OFF'

export type SAILColumnWidth = 'AUTO' | 'EXTRA_NARROW' | 'NARROW' | 'NARROW_PLUS' | 'MEDIUM' | 'MEDIUM_PLUS' | 'WIDE' | 'WIDE_PLUS' | '1X' | '2X' | '3X' | '4X' | '5X' | '6X' | '7X' | '8X' | '9X' | '10X'
export const mapToSAILColumnWidth = (columnGap: GridTrackSize | number): SAILColumnWidth => {
    if (typeof columnGap === 'number' || columnGap.type === 'FIXED') {
        const width = typeof columnGap === 'number' ? columnGap : columnGap.value
        if (width !== undefined && width <= 60) return 'EXTRA_NARROW'
        if (width !== undefined && width <= 220) return 'NARROW'
        if (width !== undefined && width <= 300) return 'NARROW_PLUS'
        if (width !== undefined && width <= 380) return 'MEDIUM'
        if (width !== undefined && width <= 540) return 'MEDIUM_PLUS'
        if (width !== undefined && width <= 780) return 'WIDE'
        return 'WIDE_PLUS'
    }

    if (columnGap.type === 'FLEX') {
        const fractionalUnits = Math.min(Math.max(Math.round(columnGap.value ?? 1), 1), 10)
        return `${fractionalUnits}X` as SAILColumnWidth
    }
    
    if (columnGap.type === 'HUG') return 'AUTO'

    return 'AUTO'
}

export type SAILColumnsLayoutSpacing = 'NONE' | 'DENSE' | 'STANDARD' | 'SPARSE'
export const mapToSAILColumnsLayoutSpacing = (gridColumnGap: number): SAILColumnsLayoutSpacing => {
    if (gridColumnGap === 0) return 'NONE'
    if (gridColumnGap <= 3) return 'DENSE'
    if (gridColumnGap <= 10) return 'STANDARD'
    return 'SPARSE'
}

export type SAILColumnsLayoutAlignVertical = 'TOP' | 'MIDDLE' | 'BOTTOM'

export type SAILImageSize = 'ICON' | 'ICON_PLUS' | 'TINY' | 'EXTRA_SMALL' | 'SMALL' | 'SMALL_PLUS' | 'MEDIUM' | 'MEDIUM_PLUS' | 'LARGE' | 'LARGE_PLUS' | 'EXTRA_LARGE' | 'FIT' | 'GALLERY'

// export type SAILStampBackgroundColor = 'ACCENT' | 'POSITIVE' | 'NEGATIVE' | 'SECONDARY' | 'TRANSPARENT' | string

// export type SAILStampContentColor = 'STANDARD' | 'ACCENT' | 'POSITIVE' | 'NEGATIVE'

export type SAILStampSize = 'TINY' | 'SMALL' | 'MEDIUM' | 'LARGE'
export const mapToSAILStampSize = (figmaStampSize: string): SAILStampSize => {
    switch (figmaStampSize) {
        case 'Tiny': return 'TINY'; break
        case 'Small': return 'SMALL'; break
        case 'Medium': return 'MEDIUM'; break
        case 'Large': return 'LARGE'; break
        default: return 'TINY'; break
    }
}

// export type SAILStampAlign = 'START' | 'CENTER'

const iconNames = [
    "",
    "vest-patches",
    "vest",
    "yin-yang",
    "viruses",
    "vector-square",
    "tram",
    "trailer",
    "traffic-light",
    "tools",
    "toolbox",
    "toilet",
    "toilet-paper-slash",
    "toilet-paper",
    "tired-o",
    "tired",
    "theater-masks",
    "tenge",
    "table-tennis",
    "tablets",
    "stream",
    "store-alt-slash",
    "stopwatch",
    "stopwatch-20",
    "star-of-life",
    "spider",
    "spell-check",
    "socks",
    "soap",
    "snowplow",
    "snowman",
    "smoking-ban",
    "sleigh",
    "slash",
    "skull",
    "skull-crossbones",
    "skiing",
    "skiing-nordic",
    "skating",
    "sink",
    "sim-card",
    "signature",
    "sign",
    "shapes",
    "seeding",
    "sd-card",
    "scroll",
    "screwdriver",
    "school",
    "satellite",
    "satellite-dish",
    "sad-tear-o",
    "sad-tear",
    "sad-cry-o",
    "sad-cry",
    "running",
    "ruler",
    "ruler-vertical",
    "ruler-horizontal",
    "route",
    "robot",
    "ring",
    "restroom",
    "remove-format",
    "pump-medical",
    "project-diagram",
    "procedures",
    "monument",
    "mitten",
    "microscope",
    "lungs-virus",
    "layer-group",
    "laugh-wink-o",
    "laugh-squint-o",
    "laugh-beam",
    "laugh-beam-o",
    "landmark",
    "kiwi-bird",
    "infinity",
    "igloo",
    "icons",
    "icicles",
    "ice-cream",
    "hryvnia",
    "house-damage",
    "hotdog",
    "hot-tub",
    "hospital-symbol",
    "hockey-puck",
    "hippo",
    "hiking",
    "highlighter",
    "helicopter",
    "head-side-virus",
    "head-side-mask",
    "head-side-cough-slash",
    "head-side-cough",
    "hat-wizard",
    "wave-square",
    "hard-hat",
    "virus-slash",
    "hammer",
    "hamburger",
    "guitar",
    "grip-horizontal",
    "grin",
    "grin-wink",
    "grin-tongue-wink",
    "grin-tongue-squint",
    "grin-tongue-squint-o",
    "grin-tears",
    "grin-tears-o",
    "grin-stars-o",
    "grin-squint",
    "grin-squint-o",
    "grin-beam-sweat",
    "holly-berry",
    "grin-alt",
    "fish",
    "first-aid",
    "grin-wink-o",
    "fill",
    "fill-drip",
    "feather",
    "feather-alt",
    "fan",
    "grin-tongue",
    "egg",
    "grin-tongue-o",
    "draw-polygon",
    "dog",
    "dizzy",
    "divide",
    "disease",
    "crutch",
    "cookie",
    "cookie-bite",
    "chess",
    "chess-rook",
    "chalkboard-teacher",
    "receipt",
    "box",
    "portrait",
    "bowling-ball",
    "dolly-flatbed",
    "border-none",
    "border-all",
    "pizza-slice",
    "book-reader",
    "piggy-bank",
    "book-open",
    "poll",
    "book-dead",
    "pills",
    "bone",
    "palette",
    "blog",
    "peace",
    "blender",
    "smog",
    "baby-carriage",
    "bread-slice",
    "baby",
    "atlas",
    "award",
    "angry",
    "angry-o",
    "air-allergies",
    "air-freshener",
    "tint-slash",
    "equals",
    "globe-americas",
    "door-open",
    "globe-alt",
    "weight-hanging",
    "hands-helping",
    "virus",
    "hand-sparkles",
    "hand-scissors",
    "hand-up",
    "faucet",
    "hand-right",
    "dungeon",
    "hand-left",
    "hand-paper",
    "hand-lizard",
    "solar-panel",
    "file-upload",
    "file-signature",
    "file-prescription",
    "file-medical",
    "file-invoice-dollar",
    "file-import",
    "shoe-prints",
    "file-download",
    "file-csv",
    "snowflake",
    "frown-o",
    "file-powerpoint",
    "male",
    "align-left",
    "file-image",
    "picture-video",
    "phone-alt-slash",
    "picture",
    "crown",
    "bookmark-o",
    "futbol-alt",
    "try",
    "share-alt",
    "lungs",
    "toggle-left",
    "phone-square-alt",
    "toggle-down",
    "headphones-alt",
    "caret-square-o-up",
    "laptop-house",
    "institution",
    "laptop-code",
    "qrcode",
    "laptop-medical",
    "unlink",
    "keyboard",
    "volume-down",
    "comment-dollar",
    "ellipsis-v",
    "hdd",
    "comment-alt",
    "gavel",
    "meh-rolling-eyes",
    "dot-circle-large",
    "store-alt",
    "check-double",
    "caret-square-down",
    "caret-square-right",
    "caret-square-left",
    "caret-square-up",
    "volume-up",
    "credit-card-solid",
    "file-audio",
    "hand-holding-water",
    "money-check-alt",
    "folder-plus",
    "file-sound-o",
    "money-check",
    "hand-pointer",
    "money-wave-alt",
    "fighter-jet",
    "cocktail",
    "unlock",
    "glass-cheers",
    "hands",
    "glass-whiskey",
    "hat-cowboy",
    "glass-martini",
    "hat-cowboy-side",
    "lemon",
    "thermometer-half",
    "home-user",
    "meh-blank",
    "fire-alt",
    "smile-beam",
    "suitcase-rolling",
    "id-card-o",
    "shower",
    "frown-alt",
    "sort-numeric-desc",
    "question-circle-o",
    "meh",
    "question-circle",
    "exclamation-circle",
    "balance-scale-left",
    "bold",
    "mobile-alt-solid",
    "backspace",
    "thermometer-full",
    "balance-scale-right",
    "info-circle",
    "hospital-user",
    "hands-wash",
    "truck-monster",
    "venus-double",
    "hospital",
    "truck-pickup",
    "signal",
    "car-alt",
    "passport",
    "calendar-week",
    "pallet",
    "calendar-day",
    "hand-spock-o",
    "user-friends",
    "subway",
    "arrow-circle-down-alt",
    "calendar-check",
    "user-cog",
    "apple",
    "unlock-keyhole",
    "gem",
    "trash-restore-alt",
    "star-half-o",
    "atom",
    "object-ungroup-solid",
    "not-equal",
    "expand-alt",
    "gas-pump",
    "crop-alt",
    "cloud-sun-rain",
    "luggage-cart",
    "window-minimize-alt",
    "sort-alpha-asc-alt",
    "clone-solid",
    "clipboard-list",
    "pen-alt",
    "wine-bottle",
    "pen",
    "wind",
    "pencil-square-o-alt",
    "list-alt-solid",
    "arrow-down",
    "tablet-alt",
    "angle-left-bold",
    "grin-squint-tears-o",
    "angle-up-bold",
    "grin-stars",
    "angle-double-right-bold",
    "greater-than",
    "angle-double-left-bold",
    "repeat-alt",
    "user-o",
    "spoon",
    "clock",
    "angle-double-up-bold",
    "sign-in",
    "sort-numeric-asc-alt",
    "key-alt",
    "store-slash",
    "space-shuttle",
    "sort-amount-desc-alt",
    "scissors-solid",
    "folder-o",
    "files-solid",
    "table-bold",
    "address-card-o",
    "user-injured",
    "arrow-circle-right-alt",
    "calendar-plus",
    "user-ninja",
    "adjust",
    "file-word",
    "hand-o-down",
    "align-justify",
    "user-shield",
    "map",
    "align-right",
    "comment-slash",
    "american-sign-language-interpreting",
    "drum-steelpan",
    "angle-down",
    "hospital-alt",
    "angle-right",
    "dice-three",
    "angle-double-left",
    "archive",
    "horse-head",
    "arrow-circle-left",
    "teeth",
    "truck-loading",
    "long-arrow-left",
    "anchor",
    "arrow-circle-down",
    "spa",
    "meh-o-rolling-eyes",
    "arrows-alt",
    "arrow-circle-right",
    "star",
    "sun",
    "surprise",
    "smile-o-beam",
    "plus-square-o",
    "arrow-circle-up",
    "signing",
    "question",
    "smile",
    "tree",
    "eject",
    "arrow-circle-o-right",
    "shield-virus",
    "arrow-circle-o-down",
    "bacterium",
    "arrow-circle-o-left",
    "heart-broken",
    "arrow-left",
    "ribbon",
    "search-dollar",
    "long-arrow-down",
    "angle-down-bold",
    "arrows-h",
    "arrows-v",
    "arrows",
    "hotel-alt",
    "asl-interpreting",
    "at",
    "wifi",
    "bath",
    "map-o",
    "smile-wink",
    "battery-quarter",
    "map-pin",
    "share-alt-sqaure",
    "battery-three-quarters",
    "sign-language",
    "mouse",
    "battery-3",
    "hand-holding-medical",
    "battery-half",
    "chess-pawn",
    "pause",
    "battery-2",
    "concierge-bell",
    "bookmark",
    "battery-1",
    "intersex",
    "battery-full",
    "tasks-alt",
    "fist-raised",
    "battery-empty",
    "pen-fancy",
    "indent",
    "user-tag",
    "battery",
    "grimace",
    "crow",
    "beer",
    "coins",
    "tablet-alt-solid",
    "bell-o",
    "language",
    "angle-left",
    "angle-double-down",
    "blind",
    "weight",
    "building-o",
    "vials",
    "bulllhorn",
    "bomb",
    "directions",
    "bolt",
    "book",
    "dice-four",
    "hand-holding-usd",
    "bus",
    "braille",
    "building",
    "bug",
    "briefcase",
    "bullseye",
    "box-open",
    "closed-captioning-solid",
    "eyedropper-solid",
    "calendar-o",
    "calendar",
    "calendar-plus-o",
    "calendar-times-o",
    "grin-beam",
    "calendar-check-o",
    "football",
    "camera-retro",
    "prescription-bottle",
    "plane-slash",
    "camera",
    "pump-soap",
    "truck-moving",
    "car",
    "place-of-worship",
    "plane-departure",
    "caret-left",
    "box-tissue",
    "caret-right",
    "caret-square-o-right",
    "dice-six",
    "cart-plus",
    "dizzy-o",
    "certificate",
    "dice-d6",
    "paint-brush",
    "chain",
    "caravan",
    "pencil-square-o",
    "chain-broken",
    "cheese",
    "paragraph",
    "check-circle",
    "door-closed",
    "check-square",
    "shield",
    "chevron-down",
    "thumbs-down",
    "chevron-right",
    "chevron-circle-down",
    "exchange",
    "gamepad",
    "circle-o",
    "globe-europe",
    "circle",
    "cloud-download",
    "hand-rock",
    "fax",
    "clone",
    "clipboard",
    "clock-o",
    "ethernet",
    "code-fork",
    "dumbbell",
    "coffee",
    "drafting-compass",
    "cog",
    "drum-stick-bite",
    "cogs",
    "business-time",
    "broom",
    "columns",
    "sun-o",
    "bus-alt",
    "border-style",
    "calendar-times",
    "user-minus",
    "comment",
    "chevron-circle-right",
    "comment-o",
    "money-solid",
    "file-video-o",
    "balance-scale",
    "comments-o",
    "dumpster",
    "user-clock",
    "comments",
    "microphone-alt-slash",
    "thermometer",
    "barcode",
    "cc",
    "check-circle-o",
    "tshirt",
    "file-excel",
    "crosshairs",
    "drivers-license",
    "bell-slash",
    "cut",
    "power-off",
    "hand-lizard-o",
    "dot-circle-o",
    "boxes",
    "deafness",
    "pencil-ruler",
    "dedent",
    "address-book-o",
    "stop-circle-o",
    "compress-arrows",
    "drivers-license-o",
    "superscript",
    "user-check",
    "stop-circle",
    "trash-solid",
    "dollar",
    "book-medical",
    "hourglass-half",
    "eraser",
    "sheqel",
    "ship",
    "deaf",
    "envelope-open-o",
    "envelope-open",
    "envelope-o",
    "keyboard-o",
    "assistive-listening-systems",
    "tape",
    "eyedropper",
    "arrow-circle-o-up",
    "send-o",
    "automobile",
    "store",
    "eye-slash",
    "thermometer-2",
    "gears",
    "exclamation-triangle",
    "calendar-minus-o",
    "cart-arrow-down",
    "check-square-o",
    "cny",
    "snowboarding",
    "external-link",
    "birthday-cake",
    "surprise-o",
    "euro",
    "futbol-o",
    "forward",
    "database",
    "toggle-off",
    "sort-numeric-desc-alt",
    "folder-open-o",
    "pictures",
    "vcard",
    "hourglass-2",
    "id-badge-solid",
    "flask",
    "flag-o",
    "plane-arrival",
    "flag",
    "stethoscope",
    "calendar-minus",
    "car-crash",
    "fire-extinguisher",
    "filter",
    "trophy",
    "mail-bulk",
    "file-photo-o",
    "file-excel-o",
    "file-audio-o",
    "address-book",
    "user-nurse",
    "cloud-showers-heavy",
    "gbp",
    "fast-forward",
    "group",
    "bullseye-alt",
    "star-o",
    "record-vinyl",
    "graduation-cap",
    "spinner-alt",
    "taxi",
    "radiation-alt",
    "globe",
    "sliders",
    "mobile-alt",
    "flame",
    "file-code-o",
    "glass",
    "level-down",
    "angle-right-bold",
    "umbrella",
    "pause-circle-o",
    "temperature-high",
    "genderless",
    "folder",
    "tint",
    "reply",
    "meh-o-blank",
    "burn",
    "photo",
    "hourglass-start",
    "biohazard",
    "plane",
    "hourglass-o",
    "pictures-o",
    "th-list",
    "hourglass-1",
    "pen-nib",
    "radiation",
    "search-location",
    "binoculars",
    "check-square-o-alt",
    "hourglass",
    "sort-alpha-desc-alt",
    "prescription-bottle-alt",
    "hotel",
    "caret-down",
    "poll-h",
    "hospital-o",
    "television",
    "angle-double-down-bold",
    "star-half-alt",
    "teeth-open",
    "home",
    "chevron-left",
    "heartbeat",
    "caret-square-o-left",
    "person-booth",
    "heart-o",
    "parachute-box",
    "hdd-o",
    "strikethrough",
    "car-side",
    "hard-of-hearing",
    "otter",
    "handshake-o",
    "transgender-alt",
    "frown-o-alt",
    "long-arrow-right",
    "file-image-o",
    "arrow-up",
    "laugh",
    "quote-left",
    "hand-peace-o",
    "oil-can",
    "hand-stop-o",
    "notes-medical",
    "hand-paper-o",
    "mug-hot",
    "hand-o-left",
    "spray-can",
    "chess-king",
    "h-square",
    "stroopwafel",
    "print",
    "cubes",
    "file-video",
    "italic",
    "comments-dollar",
    "circle-o-notch",
    "universal-access",
    "laugh-o",
    "jpy",
    "cloud-upload",
    "wheelchair-alt",
    "marker",
    "laptop",
    "list-ol",
    "microphone-slash",
    "bicycle",
    "grin-beam-sweat-o",
    "file-archive-o",
    "file",
    "handshake-alt-slash",
    "low-vision",
    "life-bouy",
    "clinic-medical",
    "industry",
    "life-buoy",
    "life-ring",
    "file-code",
    "hand-holding-heart",
    "gear",
    "lemon-o",
    "lightning",
    "cloud-moon",
    "lock",
    "x-ray",
    "list-alt",
    "list-ul",
    "vote-yea",
    "list",
    "volleyball",
    "location-arrow",
    "arrow-right",
    "recycle",
    "less-than-equal",
    "i-cursor",
    "rainbow",
    "star-half-empty",
    "water",
    "level-up",
    "vial",
    "lightbulb-o",
    "walking",
    "map-marker",
    "vr-cardboard",
    "mars",
    "tractor",
    "mars-stroke-h",
    "tooth",
    "mars-stroke-v",
    "files-invoice",
    "won",
    "mars-stroke",
    "file-o",
    "audio-description",
    "cloud",
    "backward",
    "stop",
    "mars-double",
    "voicemail",
    "magnet",
    "user-circle-o",
    "reply-all",
    "cloud-rain",
    "search-minus",
    "baseball",
    "mail-reply-all",
    "grip-lines",
    "square-full",
    "meh-o",
    "file-powerpoint-o",
    "city",
    "paperclip-bold",
    "check",
    "funnel-dollar",
    "minus-square",
    "share-square-o",
    "compress-corners",
    "hand-pointer-o",
    "flushed",
    "minus-circle",
    "frog",
    "mobile-phone",
    "shopping-cart",
    "sort-amount-asc-alt",
    "cutlery",
    "newspaper-solid",
    "folder-open",
    "flushed-o",
    "mobile",
    "bed",
    "sort-alpha-asc",
    "dolly",
    "moon-o",
    "dna",
    "mouse-pointer",
    "lightbulb",
    "soccer-ball-o",
    "microchip",
    "snowflake-o",
    "clipboard-o",
    "mortar-board",
    "dragon",
    "neuter",
    "grin-alt-o",
    "diagnoses",
    "newspaper-o",
    "capsules",
    "tags",
    "object-group",
    "chess-queen",
    "paste",
    "object-ungroup",
    "couch",
    "send",
    "outdent",
    "caret-square-o-down",
    "pepper-hot",
    "headphones",
    "step-forward",
    "angle-double-up",
    "swimmer",
    "edit",
    "chalkboard",
    "truck",
    "paw",
    "swatchbook",
    "smile-o-wink",
    "chair",
    "tablet",
    "pencil",
    "cat",
    "plus-circle",
    "play-circle-o",
    "th",
    "play",
    "cloud-moon-rain",
    "bathtub",
    "shuttle-van",
    "compress",
    "trademark",
    "battery-4",
    "inbox",
    "donate",
    "percent",
    "flag-checkered",
    "train",
    "bell-slash-o",
    "volume-control-phone",
    "battery-0",
    "thermometer-0",
    "globe-asia",
    "plug",
    "mortar-pestle",
    "image",
    "cab",
    "phone-alt",
    "Refresh",
    "laugh-squint",
    "rotate-left",
    "angle-double-right",
    "star-half-full",
    "history",
    "smoking",
    "frown",
    "rotate-right",
    "paperclip",
    "repeat",
    "rupee",
    "grip-vertical",
    "fast-backward",
    "volume-off",
    "rss-square",
    "user-times",
    "bar-chart-o",
    "plus",
    "folder-minus",
    "rss",
    "thermometer-1",
    "grin-o",
    "reorder",
    "fire",
    "thermometer-alt",
    "align-center",
    "shopping-bag",
    "area-chart",
    "users",
    "copyright-solid",
    "rocket",
    "people-carry",
    "hashtag",
    "leaf",
    "bar-chart",
    "bank",
    "legal",
    "bacon",
    "play-circle",
    "shipping-fast",
    "copy",
    "registered",
    "file-pdf-o",
    "wrench",
    "map-marked",
    "rub",
    "feed",
    "handholding",
    "rouble",
    "usd",
    "medkit",
    "times-circle",
    "sort",
    "square-root",
    "file-contract",
    "search-plus",
    "undo",
    "arrow-circle-up-alt",
    "hand-rock-o",
    "grin-hearts",
    "save",
    "splotch",
    "file-medical-alt",
    "share",
    "user-graduate",
    "hand-scissors-o",
    "ghost",
    "id-card",
    "file-picture-o",
    "paper-plane",
    "plus-square",
    "unlock-alt",
    "square",
    "basketball",
    "sort-down",
    "upload",
    "sort-desc",
    "sort-asc",
    "sort-numeric-asc",
    "shopping-basket",
    "file-text",
    "dice-one",
    "files-o",
    "desktop",
    "sort-alpha-desc",
    "calculator",
    "dice-two",
    "puzzle-piece",
    "sort-amount-asc",
    "sort-amount-desc",
    "exclamation",
    "id-badge",
    "gifts",
    "microphone-alt",
    "mask",
    "phone-square",
    "unsorted",
    "support",
    "star-half",
    "credit-card",
    "brain",
    "toggle-up",
    "percent-alt",
    "people-arrows",
    "header",
    "sitemap",
    "arrow-circle-left-alt",
    "suitcase",
    "female",
    "user-edit",
    "users-cog",
    "calendar-alt",
    "user-lock",
    "times",
    "window-restore-alt",
    "user-md",
    "grin-beam-o",
    "magic",
    "grin-hearts-o",
    "music",
    "moon",
    "street-view",
    "window-maximize",
    "ambulance",
    "greater-than-equal",
    "mail-forward",
    "commenting",
    "pencil-square",
    "rewind",
    "clipboard-check",
    "grin-squint-tears",
    "mail-reply",
    "golf-ball",
    "minus-square-o",
    "Refresh-alt",
    "user-alt",
    "archway",
    "trash-restore",
    "mercury",
    "cube",
    "dot-circle-o-large",
    "times-circle-o",
    "dice-five",
    "tasks",
    "square-o",
    "network-wired",
    "hand-o-right",
    "trash-o",
    "undo-alt",
    "sticky-note-o",
    "user-circle",
    "times-rectangle",
    "pie-chart",
    "sticky-note",
    "dashboard",
    "transgender",
    "sort-up",
    "long-arrow-up",
    "creative-commons",
    "dice-d20",
    "navicon",
    "sms",
    "expand",
    "pause-circle",
    "podcast",
    "charging-station",
    "th-large",
    "picture-o",
    "wimming-pool",
    "external-link-square",
    "chess-bishop",
    "map-marker-solid",
    "subscript",
    "object-group-solid",
    "user-tie",
    "crop",
    "toggle-on",
    "chess-board",
    "map-marked-solid",
    "server",
    "temperature-low",
    "ellipsis-h",
    "ruler-combined",
    "gift",
    "smile-o",
    "biking",
    "turkish-lira",
    "thumbs-o-up",
    "user",
    "hand-spock",
    "hand-peace",
    "window-minimize",
    "money-solid-alt",
    "file-export",
    "venus-mars",
    "search",
    "file-text-o",
    "bell",
    "comment-o-alt",
    "video-camera",
    "thermometer-empty",
    "clipboard-alt",
    "floppy-o",
    "underline",
    "compact-disc",
    "envelope-open-text",
    "thumb-tack",
    "ticket",
    "headset",
    "circle-thin",
    "meteor",
    "quote-right",
    "spinner",
    "car-battery",
    "wallet",
    "thermometer-3",
    "grimace-o",
    "angle-up",
    "syringe",
    "envelope",
    "bezier-curve",
    "hourglass-end",
    "compass",
    "bars",
    "file-movie-o",
    "toggle-right",
    "tachometer",
    "window-close",
    "chevron-circle-up",
    "flash",
    "step-backward",
    "terminal",
    "code",
    "thumbs-up",
    "chevron-up",
    "random",
    "comment-medical",
    "warning",
    "cash-register",
    "breifcase-medical",
    "tv",
    "glasses",
    "inr",
    "candy-cane",
    "grin-tongue-wink-o",
    "campground",
    "tty",
    "stamp",
    "eye",
    "chevron-circle-left",
    "registered-solid",
    "minus",
    "handshake-slash",
    "road",
    "parking",
    "hand-o-up",
    "file-archive",
    "user-alt-slash",
    "users-slash",
    "dice",
    "hand-down",
    "share-sqaure",
    "film",
    "umbrella-beach",
    "vcard-o",
    "trash",
    "mountain",
    "hand-grab-o",
    "file-pdf",
    "wine-glass-alt",
    "user-astronaut",
    "font",
    "fingerprint",
    "brush",
    "thumbs-o-down",
    "pager",
    "info",
    "less-than",
    "window-maximize-alt",
    "child",
    "user-secret",
    "caret-up",
    "prescription",
    "heart",
    "file-word-o",
    "globe-africa",
    "ruble",
    "life-ring-solid",
    "rmb",
    "money-wave",
    "shekel",
    "ban",
    "commenting-o",
    "university",
    "band-aid",
    "map-signs",
    "bacteria",
    "text-width",
    "medal",
    "phone",
    "digital-tachograph",
    "user-plus",
    "cloud-sun",
    "address-card",
    "laugh-wink",
    "krw",
    "compass-solid",
    "times-rectangle-o",
    "chess-knight",
    "text-height",
    "tag",
    "thermometer-quarter",
    "dove",
    "money",
    "video-camera-slash",
    "asterisk",
    "line-chart",
    "handshake",
    "scissors",
    "drum",
    "motorcycle",
    "download",
    "carrot",
    "broadcast-tower",
    "table",
    "user-slash",
    "envelope-square",
    "eur",
    "window-restore",
    "volume-mute",
    "sign-out",
    "microphone",
    "horse",
    "paper-plane-o",
    "file-zip-o",
    "life-saver",
    "copyright",
    "window-close-o",
    "memory",
    "ils",
    "warehouse",
    "thermometer-three-quarters",
    "key",
    "wheelchair",
    "wine-glass",
    "thermometer-4",
    "link",
    "diamond",
    "grip-lines-vertical",
    "s15",
    "paint-roller",
    "hourglass-3",
    "yen"
] as const

export type SAILIcon = typeof iconNames[number]
export const isSAILIcon = (value: unknown): value is SAILIcon => iconNames.some((icon) => icon === value)
