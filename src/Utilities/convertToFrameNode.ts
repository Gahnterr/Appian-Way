export const convertToFrameNode = (node: SlotNode | InstanceNode | ComponentNode): FrameNode => {
    const frame: FrameNode = {
        type: 'FRAME',
        name: node.name,
        layoutMode: node.layoutMode,
        layoutSizingHorizontal: node.layoutSizingHorizontal,
        layoutSizingVertical: node.layoutSizingVertical,
        constraints: node.constraints,
        width: node.width,
        height: node.height,
        x: node.x,
        y: node.y,
        fills: node.fills,
        strokes: node.strokes,
        cornerRadius: node.cornerRadius,
        counterAxisAlignContent: node.counterAxisAlignContent,
        counterAxisAlignItems: node.counterAxisAlignItems,
        counterAxisSizingMode: node.counterAxisSizingMode,
        counterAxisSpacing: node.counterAxisSpacing,
        effects: node.effects,
        paddingBottom: node.paddingBottom,
        paddingLeft: node.paddingLeft,
        paddingRight: node.paddingRight,
        paddingTop: node.paddingTop,
        children: node.children
    } as FrameNode

    return frame 
}