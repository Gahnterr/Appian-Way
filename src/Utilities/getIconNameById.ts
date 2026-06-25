export const getIconNameById = async (id: string): Promise<string> => {
    const iconNode = await figma.getNodeByIdAsync(id)
    return iconNode ? iconNode.name : ''
}