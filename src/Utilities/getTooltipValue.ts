import { __getComponentProps } from "./getComponentProps"

export const getTooltipValue = (instanceNode: InstanceNode, props: ComponentProperties): string | undefined => {
    if (props['Show Help Icon'].value as boolean) {
        const tooltip: InstanceNode | undefined = instanceNode.exposedInstances.find(exposedInstance => exposedInstance.name === 'Tooltip') as InstanceNode
        const tooltipProps = __getComponentProps(tooltip)
        return tooltipProps['Label'].value as string
    } else return undefined
}