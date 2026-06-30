// export const getBoundVariableName = async (node: SceneNode, field: VariableBindableNodeField): Promise<string | undefined> => {
//     const boundVariables = node.boundVariables
//     if (boundVariables !== undefined && boundVariables[field] !== undefined) {
//         const variableName = await figma.variables.getVariableByIdAsync(boundVariables[field]?.id)
//         return variableName?.id
//     }
//     else return undefined
// }

// export const getBoundVariableName = async (boundVariable:  | undefined): string => {
//     const variable = await figma.variables.getVariableByIdAsync(boundVariable.id)

// }

// // export function hasBoundVariable(node: SceneNode, field: VariableBindableNodeField): boolean {
// //     return (node.boundVariables !== null || node.boundVariables !== undefined)
// //     && node.boundVariables
// // }