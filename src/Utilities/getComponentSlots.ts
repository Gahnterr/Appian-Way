import { isSlotNode } from "../typeguards"
import { getMainComponentName } from "./getMainComponentName"

export const getComponentSlot = (instanceNode: InstanceNode, slotName: string): SlotNode | undefined => {
    const slotNode = instanceNode.findOne(child => child.type === 'SLOT' && child.name === slotName)
    return slotNode !== null && isSlotNode(slotNode) ? slotNode : undefined
}

export const getItemsFromSlot = (slotNode: SlotNode): SceneNode[] => {
    if (!Array.isArray(slotNode.children)) return []

    return slotNode.children.map(child => child)
}

export const getTagItemsFromSlot = async (slotNode: SlotNode): Promise<InstanceNode[]> => {
    const slotItems = getItemsFromSlot(slotNode)
    const instanceItems = slotItems.filter((item): item is InstanceNode => item.type === 'INSTANCE')
    const tagItems: InstanceNode[] = []
    for (const instance of instanceItems) {
        if (await getMainComponentName(instance) === 'Tag Item') tagItems.push(instance)
    }

    return tagItems
}
