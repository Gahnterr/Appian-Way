import { isSlotNode } from "../typeguards"

export const getComponentSlot = (instanceNode: InstanceNode, slotName: string): SlotNode | null => {
    const slotNode = instanceNode.findOne(child => child.type === 'SLOT' && child.name === slotName)
    return slotNode !== null && isSlotNode(slotNode) ? slotNode : null
}

export const getItemsFromSlot = (slotNode: SlotNode): SceneNode[] => {
    return slotNode.children.map(child => child)
}
