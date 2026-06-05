export const getMainComponentName = async (instanceNode: InstanceNode, type: 'COMPONENT_SET' | 'COMPONENT'): Promise<string | null> => {
    const componentNode = await instanceNode.getMainComponentAsync()
    const componentSetNode = componentNode?.parent

    if (type === 'COMPONENT_SET') {
        return componentSetNode?.name ?? null
    } else if (type === 'COMPONENT') {
        return componentNode?.name ?? null
    } else return null
}