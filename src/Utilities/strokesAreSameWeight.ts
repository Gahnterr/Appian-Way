export function strokesAreSameWeight(...strokes: number[]) {
    const weightChecks: boolean[] = []
    for (const [index, stroke] of strokes.entries()) {
        const otherStrokesToCompareWith = strokes.toSpliced(index, 1)
        for (const otherStroke of otherStrokesToCompareWith) {
            weightChecks.push(stroke === otherStroke)
        }
    }
    return weightChecks.every(check => check === true)
}