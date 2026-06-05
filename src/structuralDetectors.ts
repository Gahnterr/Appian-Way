import { getMainComponentName } from "./getMainComponentName"

const hasNoChildren = (child: SceneNode): boolean => {
    return !('children' in child) || child.children.length === 0
}

export const isButtonArrayFrame = async (frame: FrameNode): Promise<boolean> => {
    if (frame.children.length === 0) return false

    for (const child of frame.children) {
        if (child.type !== 'INSTANCE') return false
        if (await getMainComponentName(child, 'COMPONENT_SET') !== 'Button') return false
    }
    return true
}

export const isCardLayoutFrame = (frame: FrameNode): boolean => {
    if (frame.layoutMode === 'VERTICAL') return true
    else return false
}

export const isSideBySideFrame = (frame: FrameNode): boolean => {
    if (frame.layoutMode === 'HORIZONTAL' && frame.children.length > 1) return true
    return false
}

export const isColumnLayoutFrame = (frame: FrameNode): boolean => {
    if ( frame.layoutMode === 'HORIZONTAL' && frame.children.length > 1) return true
    return false
}