import { generateButtonArrayLayout, isButtonArrayFrame } from "./SAILComponents/Action/ButtonArrayLayout"
import { generateHorizontalLine } from "./SAILComponents/Display/HorizontalLine"
import { generateImageField, isImageField } from "./SAILComponents/Display/ImageField"
import { generateRichTextDisplayField, generateSingleRichTextIcon, isRichTextDisplayFieldFrame } from "./SAILComponents/Display/RichTextDisplayField"
import { generateStampField } from "./SAILComponents/Display/StampField"
import { generateParagraphField } from "./SAILComponents/Inputs/ParagraphField"
import { generateTextField } from "./SAILComponents/Inputs/TextField"
import { generateCardLayout, isCardLayoutFrame } from "./SAILComponents/Layouts/CardLayout"
import { generateColumnsLayout, isColumnsLayoutFrame } from "./SAILComponents/Layouts/ColumnsLayout"
import { generateSideBySideLayout, isSideBySideLayoutFrame } from "./SAILComponents/Layouts/SideBySideLayout"
import { isSAILIcon } from "./SAILComponents/SAILParameters"
import { generateBooleanCheckboxField } from "./SAILComponents/Selection/BooleanCheckboxField"
import { generateCheckboxField } from "./SAILComponents/Selection/CheckboxField"
import { generateDropdownField } from "./SAILComponents/Selection/DropdownField"
import { generateRadioButtonField } from "./SAILComponents/Selection/RadioButtonField"
import { getMainComponentName } from "./Utilities/getMainComponentName"
import { indent, indentStringArray } from "./Utilities/indent"

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

  const addToCode = async (generate: string[]): Promise<void> => {
    code.push(...indentStringArray(generate, nestingLevel))
  }

  code.push(...indent(`/* ${currentNode?.name} */`, nestingLevel))

  switch (currentNode?.type) {
    case 'RECTANGLE': {
      if (isImageField(currentNode)) {
        code.push(...indentStringArray(generateImageField(currentNode), nestingLevel))
      }
    }; break
    case 'FRAME': {
      await generateFrameComponent(currentNode, code, nestingLevel)
      break
    }
    case 'TEXT':
      code.push(...indentStringArray(await generateRichTextDisplayField(currentNode), nestingLevel))
      break
    case 'INSTANCE': {
      await generateInstanceComponent(currentNode, addToCode, code, nestingLevel)
      break
    }
    default: code.push(`/* Invalid element selected. */`)
  }
  return code
}

async function generateInstanceComponent(currentNode: InstanceNode, addToCode: (generate: string[]) => Promise<void>, code: string[], nestingLevel: number) {
  if (isSAILIcon(currentNode.name)) {
    addToCode(await generateSingleRichTextIcon(currentNode))
  } else {
    const mainComponentName = await getMainComponentName(currentNode)
    switch (mainComponentName) {
      case 'Stamp':
        addToCode(await generateStampField(currentNode))
        break
      case 'Button':
        addToCode(await generateButtonArrayLayout(currentNode))
        break
      case 'Text Field':
        addToCode(await generateTextField(currentNode))
        break
      case 'Paragraph Field':
        addToCode(await generateParagraphField(currentNode))
        break
      case 'Radio Buttons Field':
        addToCode(await generateRadioButtonField(currentNode))
        break
      case 'Check Box Field':
        addToCode(await generateCheckboxField(currentNode))
        break
      case 'Dropdown':
        addToCode(await generateDropdownField(currentNode))
        break
      case 'Boolean Check Box':
        addToCode(await generateBooleanCheckboxField(currentNode))
        break
      case 'Horizontal Line': 
        addToCode(await generateHorizontalLine(currentNode))
        break
      case 'Card Layout': {
        const contentsSlot = currentNode.findOne(node => node.name === 'Contents')
        if (!contentsSlot || contentsSlot.type !== 'SLOT') {
          code.push(`/* Card Layout instance has no 'Contents' slot. */`)
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
        code.push(`/* This instance is not recognized as a supported SAIL component. */`)
    }
  }
}

async function generateFrameComponent(currentNode: FrameNode, code: string[], nestingLevel: number) {
  if (await isButtonArrayFrame(currentNode)) {
    code.push(...indentStringArray(await generateButtonArrayLayout(currentNode), nestingLevel))
  } else if (await isRichTextDisplayFieldFrame(currentNode)) {
    code.push(...indentStringArray(await generateRichTextDisplayField(currentNode), nestingLevel))
  } else if (await isSideBySideLayoutFrame(currentNode)) {
    const childrenCode: string[][] = []

    for (const child of currentNode.children) {
      childrenCode.push(await generateSAILFromNode(child, nestingLevel))
    }

    code.push(...indentStringArray(generateSideBySideLayout(currentNode, childrenCode), nestingLevel))

  } else if (isColumnsLayoutFrame(currentNode)) {
    const childrenCode: string[][] = []
    const isGridLayout = currentNode.layoutMode === 'GRID'

    if (isGridLayout) {
      for (const child of currentNode.children) {
        childrenCode.push(await generateSAILFromNode(child, nestingLevel))
      }
    } else {
      for (const child of currentNode.children) {
        const columnContents: string[] = []
        columnContents.push(...await generateSAILFromNode(child, nestingLevel))
        childrenCode.push(columnContents)
      }
    }

    code.push(...indentStringArray(generateColumnsLayout(currentNode, childrenCode), nestingLevel))

  } else if (await isCardLayoutFrame(currentNode)) {
    const childrenCode: string[] = []

    for (const child of currentNode.children) {
      childrenCode.push(...await generateSAILFromNode(child, nestingLevel))
    }

    code.push(...indentStringArray(await generateCardLayout(currentNode, childrenCode), nestingLevel))

  } else code.push(`/* This frame is not recognized as a supported SAIL component. */`)
}

