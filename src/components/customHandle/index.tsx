import React, { useMemo } from 'react';
import { getConnectedEdges, Handle, useNodeId, useStore } from 'reactflow';

const selector = (s: any) => ({
    nodeInternals: s.nodeInternals,
    edges: s.edges,
});

const CustomHandle = (props: any) => {
    const { nodeInternals, edges } = useStore(selector);
    const nodeId = useNodeId();

    const isHandleConnectable = useMemo(() => {
        if (typeof props.isConnectable === 'function') {
            const node = nodeInternals.get(nodeId);
            const connectedEdges = getConnectedEdges([node], edges);

            return props.isConnectable({ node, connectedEdges });
        }

        if (typeof props.isConnectable === 'number') {
            const node = nodeInternals.get(nodeId);
            const connectedEdges = getConnectedEdges([node], edges);

            return connectedEdges.length < props.isConnectable;
        }

        return props.isConnectable;
    }, [props, nodeInternals, nodeId, edges]);

    return (
        <Handle {...props} style={{ background: '#3f3f46', width: '.8rem', height: '.8rem', boxShadow: 'inset 0 0 0 .1rem white, 0 0 0 .2rem #3f3f46'}} isConnectable={isHandleConnectable}></Handle>
    );
};

export default CustomHandle;
