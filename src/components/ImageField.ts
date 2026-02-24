// --- Image Field Component ---
//
// Generates SAIL code for an Appian Image Field (a!imageField).
// Runs when the selected node has image fills (rectangles, ellipses, etc.).
// Outputs a placeholder a!imageField() with a document() stub.

import { imageField } from '../templates'

/**
 * Generate a!imageField SAIL code for a node that contains an image fill.
 * Uses a placeholder document reference since we can't export actual assets.
 */
export function generateImageFieldSAIL(node: SceneNode): string {
  // Try to read the node's dimensions for the size prop
  let size: string | undefined
  if ('width' in node && 'height' in node) {
    if (node.width <= 40 && node.height <= 40) {
      size = 'ICON'
    } else if (node.width <= 120) {
      size = 'SMALL'
    } else if (node.width <= 280) {
      size = 'MEDIUM'
    } else {
      size = 'LARGE'
    }
  }

  const altText = node.name || 'image'

  return imageField({ altText, size })
}
