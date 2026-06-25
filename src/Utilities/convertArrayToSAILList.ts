export const convertArrayToSAILList = (array: string[] | number[]): string => {
    const valuesWrappedInQuotes: string[] = []

    array.forEach(item => { 
        if (typeof item === 'string') valuesWrappedInQuotes.push(`"${item}"`) // Wraps string values in quotes.
        else valuesWrappedInQuotes.push(`${item}`) // Does not wrap numbers in quotes.
    })
    
    return valuesWrappedInQuotes.join(`, `)
}