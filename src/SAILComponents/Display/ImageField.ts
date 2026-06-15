import { SAILImageSize } from "../SAILParameters"

type ImageFieldProps = {
    size?: SAILImageSize
}

const ImageField = ({size = 'MEDIUM'}: ImageFieldProps): string[] => {
    const code: string[] = []

    //TODO: Flesh this component out
    code.push(`a!imageField(`)
    code.push(`  labelPosition: "COLLAPSED",`)
    code.push(`  images: {`)
    code.push(`    a!documentImage(`)
    code.push(`      document: a!EXAMPLE_DOCUMENT_IMAGE()`)
    code.push(`    )`)
    code.push(`  },`)
    code.push(`  size: "${size}"`)
    code.push(`),`)
    return code
}

export const generateImageField = (node: RectangleNode | FrameNode): string[] => {
    // TODO: Flesh out this function
    const size: SAILImageSize = 'MEDIUM'
    return ImageField({ size })
}

export const isImageField = (node: RectangleNode | FrameNode): boolean => {
    if (node.isAsset) return true
    else return false
}