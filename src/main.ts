import { generateButtonArrayLayout, isButtonArrayFrame } from "./SAILComponents/Action/ButtonArrayLayout"
import { generateHorizontalLine } from "./SAILComponents/Display/HorizontalLine"
import { generateImageField, isImageField } from "./SAILComponents/Display/ImageField"
import { generateRichTextDisplayField, generateSingleRichTextIcon, isRichTextDisplayFieldFrame } from "./SAILComponents/Display/RichTextDisplayField"
import { generateStampField } from "./SAILComponents/Display/StampField"
import { generateTagField, generateTagItem } from "./SAILComponents/Display/TagField"
import { generateDateTimeField } from "./SAILComponents/Inputs/DateTimeField"
import { generateParagraphField } from "./SAILComponents/Inputs/ParagraphField"
import { generateTextField } from "./SAILComponents/Inputs/TextField"
import { generateCardLayout, generateCardWithHorizontalLayout, isCardLayoutNode, isFrameWithChildrenInHorizontalLayout } from "./SAILComponents/Layouts/CardLayout"
import { generateColumnsLayout, isColumnsLayoutFrame } from "./SAILComponents/Layouts/ColumnsLayout"
import { generateSectionLayout } from "./SAILComponents/Layouts/SectionLayout"
import { generateSideBySideLayout, isSideBySideLayoutFrame } from "./SAILComponents/Layouts/SideBySideLayout"
import { isSAILIcon } from "./SAILComponents/SAILParameters"
import { generateBooleanCheckboxField } from "./SAILComponents/Selection/BooleanCheckboxField"
import { generateCheckboxField } from "./SAILComponents/Selection/CheckboxField"
import { generateDropdownField } from "./SAILComponents/Selection/DropdownField"
import { generateRadioButtonField } from "./SAILComponents/Selection/RadioButtonField"
import { generateSegmentedController } from "./SAILComponents/Selection/SegmentedController"
import { generateToggleField } from "./SAILComponents/Selection/ToggleField"
import { convertToFrameNode } from "./Utilities/convertToFrameNode"
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

async function generateSAILFromNode(currentNode: SceneNode | null, nestingLevel: number = 0, isSideBySideContent = false): Promise<string[]> {
  const code: string[] = []

  const addToCode = async (generate: string[]): Promise<void> => {
    code.push(...indentStringArray(generate, nestingLevel))
  }
  code.push(...indent(`/* ${currentNode?.name} */`, nestingLevel))
  switch (currentNode?.type) {
    case 'FRAME': {
      await generateFrameComponent(currentNode, code, nestingLevel, isSideBySideContent)
      break
    }
    case 'LINE': {
      if (currentNode.width > currentNode.height) await addToCode(await generateHorizontalLine(currentNode))
      break
    }
    case 'VECTOR': {
      if (currentNode.width > currentNode.height) await addToCode(await generateHorizontalLine(currentNode))
      break
    }
    case 'GROUP': {
      if (currentNode.children.length === 1) addToCode(await generateSAILFromNode(currentNode.children[0]))
      break
    }
    case 'RECTANGLE': {
      if (isImageField(currentNode)) {
        code.push(...indentStringArray(generateImageField(currentNode), nestingLevel))
      }
      break
    }
    case 'TEXT':
      addToCode(await generateRichTextDisplayField(currentNode))
      break
    case 'INSTANCE': {
      await generateInstanceComponent(currentNode, addToCode, code, nestingLevel, isSideBySideContent)
      break
    }
    case 'SLOT': {
      code.splice(code.length - 1) // Prevents duplicate layer names in the generated code.
      code.push(`{`)
      if (currentNode.layoutMode === 'GRID') {
        const childrenCode: string[][] = []
        for (const child of currentNode.children) {
          childrenCode.push(await generateSAILFromNode(child, nestingLevel))
        }
        await addToCode(generateColumnsLayout(currentNode, childrenCode))
      } else {
        const slotContents = currentNode.children
        for (const node of slotContents) {
          await addToCode(await generateSAILFromNode(node, nestingLevel + 1))
        }
      }
      code.push(`},`)
      break
    }
    default: code.push(`/* Invalid element selected. */`)
  }
  return code
}

async function generateInstanceComponent(currentNode: InstanceNode, addToCode: (generate: string[]) => Promise<void>, code: string[], nestingLevel: number, isSideBySideContent?: boolean) {
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
      case 'Date & Time':
        addToCode(await generateDateTimeField(currentNode))
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
      case 'Toggle':
        addToCode(await generateToggleField(currentNode))
        break
      case 'Horizontal Line':
        addToCode(await generateHorizontalLine(currentNode))
        break
      case 'Segmented Controller':
        addToCode(await generateSegmentedController(currentNode))
        break
      case 'Tag Field': {
        addToCode(await generateTagField(currentNode))
        break
      }
      case 'Tag Item': {
        addToCode(await generateTagItem(currentNode))
        break
      }
      case 'Section': {
        const contentsSlot = getContentsSlotNodeFrom(currentNode, code)
        if (!contentsSlot) break

        const childrenCode: string[] = []

        for (const child of contentsSlot.children) {
          childrenCode.push(...await generateSAILFromNode(child, nestingLevel))
        }

        code.push(...indentStringArray(await generateSectionLayout(currentNode, childrenCode), nestingLevel))
        break
      }
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
        code.splice(code.length - 1) // Prevents duplicate layer names in the generated code.
        code.push(`/* The following instance is not recognized as a supported SAIL component and is being treated as a regular Frame: */`)
        addToCode(await generateSAILFromNode(convertToFrameNode(currentNode), nestingLevel, isSideBySideContent))
        break
    }
  }
}

async function generateFrameComponent(currentNode: FrameNode, code: string[], nestingLevel: number, isSideBySideContent = false) {
  if (isUselessFrame(currentNode)) {
    code.push(...indentStringArray(await generateSAILFromNode(currentNode.children[0]), nestingLevel))
  } else if (await isButtonArrayFrame(currentNode)) {
    code.push(...indentStringArray(await generateButtonArrayLayout(currentNode), nestingLevel))
  } else if (await isRichTextDisplayFieldFrame(currentNode)) {
    code.push(...indentStringArray(await generateRichTextDisplayField(currentNode), nestingLevel))
  } else if (await isCardLayoutNode(currentNode) && !isSideBySideContent) {
    if (isFrameWithChildrenInHorizontalLayout(currentNode)) {
      const childrenCode: string[][] = []
      for (const child of currentNode.children) {
        if (child) childrenCode.push(await generateSAILFromNode(child, nestingLevel, true))
      }
      code.push(...indentStringArray(await generateCardWithHorizontalLayout(currentNode, childrenCode)))
    } else {
      const childrenCode: string[][] = []
      for (const child of currentNode.children) {
        if (child) childrenCode.push(await generateSAILFromNode(child, nestingLevel))
      }
      code.push(...indentStringArray(await generateCardLayout(currentNode, childrenCode.flat()), nestingLevel))
    }

  } else if (await isSideBySideLayoutFrame(currentNode, isSideBySideContent)) {
    if (currentNode.layoutMode === 'VERTICAL' && isSideBySideContent) {
      // For stacking nested sideBySideLayout content
      for (const child of currentNode.children) {
        code.push(...await generateSAILFromNode(child, nestingLevel, true))
      }
    } else {
      const childrenCode: string[][] = []
      for (const child of currentNode.children) {
        childrenCode.push(await generateSAILFromNode(child, nestingLevel, true))
      }
      code.push(...indentStringArray(generateSideBySideLayout(currentNode, childrenCode), nestingLevel))
    }
  } else if (isColumnsLayoutFrame(currentNode) && !isSideBySideContent) {
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

  } else code.push(...["/* This frame's contents cannot be translated into SAIL code.", "   Ensure valid and updated Verato UI design library components are being used. */"])
}

function isUselessFrame(currentNode: FrameNode) {
  return currentNode.type === 'FRAME'
    && currentNode.children.length === 1
    && Array.isArray(currentNode.fills) && currentNode.fills.length === 0
    && Array.isArray(currentNode.strokes) && currentNode.strokes.length === 0
    && currentNode.paddingBottom === 0 && currentNode.paddingTop === 0 && currentNode.paddingLeft === 0 && currentNode.paddingRight === 0
    && currentNode.effects.length === 0
}

function getContentsSlotNodeFrom(node: InstanceNode, code: string[]): SlotNode | undefined {
  const contentsSlot = node.findOne(n => n.name === 'Contents' && n.type === 'SLOT')
  if (!contentsSlot || contentsSlot.type !== 'SLOT') {
    code.push(`/* Section Layout instance has no 'Contents' slot. */`)
    return undefined
  } else return contentsSlot
}