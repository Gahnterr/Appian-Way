export const __getMainComponentName = async (instanceNode: InstanceNode, type: 'COMPONENT_SET' | 'COMPONENT'): Promise<string | null> => {
    const componentNode = await instanceNode.getMainComponentAsync()
    const componentSetNode = componentNode?.parent

    if (type === 'COMPONENT_SET') {
        return componentSetNode?.name ?? null
    } else if (type === 'COMPONENT') {
        return componentNode?.name ?? null
    } else return null
}
export const getMainComponentName = async (instanceNode: InstanceNode): Promise<string | undefined> => {
    const mainComponent = await instanceNode.getMainComponentAsync()
    if (!mainComponent) return undefined
    if (mainComponent.parent && mainComponent.parent.type === 'COMPONENT_SET') return mainComponent.parent.name
    else return mainComponent.name
}