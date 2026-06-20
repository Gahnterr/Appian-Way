import { SAILIcon } from "./SAILComponents/SAILParameters"

export const isSlotNodesArray = (node: SceneNode[]): node is SlotNode[] => {
    return Array.isArray(node)
        && node.every(n => n.type === 'SLOT')
        && node !== null
        && node !== undefined
}

export const isSlotNode = (node: SceneNode): node is SlotNode => {
    return node?.type === 'SLOT' 
    && node !== null 
    && node !== undefined
}

export const isInstanceNodesArray = (node: SceneNode[]): node is InstanceNode[] => {
    return Array.isArray(node)
    && node.every(n => n.type === 'INSTANCE')
    && node !== null
    && node !== undefined
}

export const isLineNode = (node: SceneNode): node is LineNode => {
    return node?.type === 'LINE'
    && node !== null 
    && node !== undefined
}

export const isString = (param: unknown): param is string => {
    return (typeof param === 'string')
}

export const stringProp = (value: string | boolean): string => {
    if (isString(value)) return value
    else throw new Error(`Received an invalid component prop value: ${value.toString()}`)
}

export const isBoolean = (param: unknown): param is boolean => {
    return (typeof param === 'boolean')
}

export const booleanProp = (value: string | boolean): boolean => {
    if (isBoolean(value)) return value
    else if (value === 'True' || value === 'Yes') return true
    else if (value === 'False' || value === 'No') return false
    else throw new Error(`Received an invalid component prop value: ${value.toString()}`)
}