export const getComponentProps = (instanceNode: InstanceNode) => {
    const resultingProps: ComponentProperties = {}
    const exposedInstances = instanceNode.exposedInstances

    const simplifyKeyName = (keyName: string): string => {
        if (keyName.includes('#')) return keyName.substring(0, keyName.indexOf('#'))
        return keyName
    }

    const prefixExposedInstanceName = (keyName: string, instanceNodeName: string): string => {
        return `${instanceNodeName}/${simplifyKeyName(keyName)}`
    }

    for (const [propName, propValue] of Object.entries(instanceNode.componentProperties)) {
        resultingProps[simplifyKeyName(propName)] = propValue
    }

    if (exposedInstances && Array.isArray(exposedInstances)) exposedInstances.forEach(instance => {
        for (const [propName, propValue] of Object.entries(instance.componentProperties)) {
            resultingProps[prefixExposedInstanceName(propName, instance.name)] = propValue
        }
    })

    return resultingProps
}

export const __getComponentProps = (instanceNode: InstanceNode, nestedInstances?: InstanceNode[] | InstanceNode): ComponentProperties => {
    const instanceProps: ComponentProperties = {}
    let nestedProps: ComponentProperties = {}

    // Strips the #id that Figma adds to component properties. That way you can cleanly index by just the same name you see on Figma
    for (const [propName, propValue] of Object.entries(instanceNode.componentProperties)) {
        let newKey: string = propName
        if (propName.includes('#')) {
            newKey = propName.substring(0, propName.indexOf('#'))
        }
        instanceProps[newKey] = propValue
    }

    // Recursively get component properties from exposed nested instances that the given instance node may have. If any are found, they are returned at the end of the object.
    if (nestedInstances && !Array.isArray(nestedInstances)) {
        nestedProps = { ...__getComponentProps(nestedInstances) }
    } else if (nestedInstances && Array.isArray(nestedInstances)) {
        nestedInstances.forEach(nestedInstance => nestedProps = { ...__getComponentProps(nestedInstance) })
    }

    return { ...instanceProps, ...nestedProps }
} 