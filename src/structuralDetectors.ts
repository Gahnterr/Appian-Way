import { getMainComponentName } from "./getMainComponentName"

export const isButtonArrayFrame = async (frame: FrameNode): Promise<boolean> => {
    if (frame.children.length === 0) return false

    for (const child of frame.children) {
        if (child.type !== 'INSTANCE') return false
        if (await getMainComponentName(child, 'COMPONENT_SET') !== 'Button') return false
    }
    return true
}

export const isRichTextIcon = async (node: SceneNode): Promise<boolean> => {
    if (node.type !== 'INSTANCE') return false
    const mainComponentName = await getMainComponentName(node, 'COMPONENT')
    return mainComponentName !== null && /^[a-z0-9-]+$/.test(mainComponentName)
}

export const isRichTextDisplayFieldFrame = async (frame: FrameNode): Promise<boolean> => {
    const childMatches = await Promise.all(
        frame.children.map(async child => child.type === 'TEXT' || await isRichTextIcon(child))
    )
    return childMatches.every(childMatches => childMatches)
}

export const isCardLayoutFrame = (frame: FrameNode): boolean => {
    if (frame.layoutMode === 'VERTICAL') return true
    else return false
}

export const isSideBySideFrame = (frame: FrameNode): boolean => {
    if (frame.layoutMode === 'HORIZONTAL' && frame.children.length > 1) return true
    return false
}

export const isColumnsLayoutFrame = (frame: FrameNode): boolean => frame.layoutMode === 'GRID'
