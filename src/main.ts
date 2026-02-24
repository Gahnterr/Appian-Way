// --- Figma Codegen Plugin Entry Point ---
//
// Registers the codegen handler that generates SAIL code
// for whichever node is selected in Figma's Dev Mode.

import { generateSAILForNode } from './codegen'

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
