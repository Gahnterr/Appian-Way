export type AppliedModes = Record<string, string>

export const getAppliedModes = async (node: SceneNode): Promise<AppliedModes> => {
    const modes: AppliedModes = {}
    for (const [collectionId, modeId] of Object.entries(node.resolvedVariableModes)) {
        const collection = await figma.variables.getVariableCollectionByIdAsync(collectionId)
        if (collection) {
            modes[collection.name] = collection.modes.find((m) => m.modeId === modeId)?.name ?? ''
        }
    }
    return modes
}