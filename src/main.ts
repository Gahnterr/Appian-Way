
import { indentStringArray } from "./indent"
import { generateButtonArrayLayout, generateButtonWidget } from "./SAILComponents/ButtonArrayLayout"
import { generateCardLayout } from "./SAILComponents/CardLayout"
import { generateRichTextDisplayField } from "./SAILComponents/RichTextDisplayField"
import { generateSideBySideLayout } from "./SAILComponents/SideBySideLayout"
import { isButtonArrayFrame, isCardLayoutFrame, isSideBySideFrame } from "./structuralDetectors"

if (figma.mode === 'codegen') {
  figma.codegen.on('preferenceschange', async (event) => {
    if (event.propertyName === 'openPanel') {
      figma.showUI(__html__, { width: 800, height: 600, title: 'Appian Way' })
    }
  })

  figma.codegen.on('generate', async (event) => {
    const code: string[] = await generateSAILFromNode(event.node)
    const lastLineIndex = code.length - 1
    const lastLine = code[lastLineIndex]
    if (lastLine?.endsWith(',')) {
      code[lastLineIndex] = lastLine.slice(0, -1)
    }

    return [
      {
        language: 'JAVASCRIPT',
        code: code.join('\n'),
        title: 'SAIL Code',
      },
    ]
  })
} else {
  figma.showUI(__html__, { width: 800, height: 600, title: 'Appian Way' })
}

async function generateSAILFromNode(currentNode: SceneNode | null, nestingLevel: number = 0): Promise<string[]> {
  const code: string[] = []

  switch (currentNode?.type) {
    case 'FRAME': {
      if (await isButtonArrayFrame(currentNode)) {
        code.push(...indentStringArray(await generateButtonArrayLayout(currentNode), nestingLevel))
      } else if (isCardLayoutFrame(currentNode)) {
        const childrenCode: string[] = []
        for (const child of currentNode.children) {
          childrenCode.push(...await generateSAILFromNode(child, nestingLevel))
        }
        code.push(...indentStringArray(await generateCardLayout(currentNode, childrenCode), nestingLevel))
      } else if (isSideBySideFrame(currentNode)) {
        const childrenCode: string[][] = []
        for (const child of currentNode.children) {
          childrenCode.push(await generateSAILFromNode(child, nestingLevel))
        }
        code.push(...indentStringArray(generateSideBySideLayout(currentNode, childrenCode), nestingLevel))
      } else {
        code.push(`// This frame is not recognized as a supported SAIL component.`)
      }
      break
    }
    case 'TEXT':
      code.push(...indentStringArray(generateRichTextDisplayField(currentNode), nestingLevel)); break
    case 'INSTANCE': {
      const mainComponent = await currentNode.getMainComponentAsync()
      if (!mainComponent) {
        code.push(`// Could not resolve main component for this instance.`)
        break
      }

      if (mainComponent.parent?.type === 'COMPONENT_SET') {
        switch (mainComponent.parent.name) {
          case 'Button':
            code.push(...indentStringArray(await generateButtonWidget(currentNode), nestingLevel))
            break
          default:
            code.push(`// This instance is not recognized as a supported SAIL component.`)
        }
      } else {
        switch (mainComponent.name) {
          case 'Card Layout': {
            const contentsSlot = currentNode.findOne(node => node.name === 'Contents')
            if (!contentsSlot || contentsSlot.type !== 'SLOT') {
              code.push(`// Card Layout instance has no 'Contents' slot.`)
              break
            }
            const childrenCode: string[] = []
            for (const child of contentsSlot.children) {
              childrenCode.push(...await generateSAILFromNode(child, nestingLevel))
            }
            code.push(...indentStringArray(await generateCardLayout(currentNode, childrenCode), nestingLevel))
            break
          }
          default:
            code.push(`// This instance is not recognized as a supported SAIL component.`)
        }
      }
      break
    }
    default: code.push(`Select a compatible object to generate SAIL code.`)
  }
  return code
}
