// --- Figma Plugin Entry Point ---
//
// Two modes:
// - Dev Mode codegen: emits SAIL code for the selected node.
// - Design Mode (normal plugin run): shows the Appian Way UI window.

import { generateSAILForNode } from './codegen'

if (figma.mode === 'codegen') {
  figma.codegen.on('preferenceschange', async (event) => {
    if (event.propertyName === 'openPanel') {
      figma.showUI(__html__, { width: 800, height: 600, title: 'Appian Way' })
    }
  })

  figma.codegen.on('generate', async (event) => {
    const node = event.node
    try {
      const codeResult = await generateSAILForNode(node)
      let codeString: string
      if (typeof codeResult === 'string') {
        codeString = codeResult
      } else if (codeResult && typeof codeResult === 'object' && 'code' in codeResult) {
        codeString = codeResult.code
      } else {
        codeString = ''
      }
      return [
        {
          language: 'JAVASCRIPT',
          code: codeString || '// Select a supported SAIL component.',
          title: 'SAIL Code',
        },
      ]
    } catch (e) {
      return [
        {
          language: 'JAVASCRIPT',
          code: `// Error generating SAIL: ${e instanceof Error ? e.message : String(e)}`,
          title: 'SAIL Code',
        },
      ]
    }
  })
} else {
  figma.showUI(__html__, { width: 800, height: 600, title: 'Appian Way' })
}
