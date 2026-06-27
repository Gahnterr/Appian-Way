import { isSlotNode } from "../typeguards"

export const getComponentSlot = (instanceNode: InstanceNode, slotName: string): SlotNode | undefined => {
    const slotNode = instanceNode.findOne(child => child.type === 'SLOT' && child.name === slotName)
    return slotNode !== null && isSlotNode(slotNode) ? slotNode : undefined
}

export const getItemsFromSlot = (slotNode: SlotNode): SceneNode[] => {
    if (!Array.isArray(slotNode.children)) return []

    return slotNode.children.map(child => child)
}
