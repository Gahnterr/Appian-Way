type StrokeWeights = {
    top: number
    right: number
    bottom: number
    left: number
}

type StrokeDirection = 'top' | 'right' | 'bottom' | 'left'

type HeaviestStrokeWeight = {
    position: StrokeDirection
    weight: number
}

export function getHeaviestStroke(strokeWeights: StrokeWeights): HeaviestStrokeWeight {
    const heaviestStrokeNumber = Math.max(...Object.values(strokeWeights))
    const heaviestStrokeDirection = Object.keys(strokeWeights).find(key => strokeWeights[key as StrokeDirection] === heaviestStrokeNumber) as StrokeDirection
    return { position: heaviestStrokeDirection, weight: heaviestStrokeNumber }
}
