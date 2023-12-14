function convertToCustomFormat(reactFlowObject: any) {
  const customFormatObject: any = {
    steps: [],
    viewport: reactFlowObject.flow.viewport,
  };

  reactFlowObject.flow.nodes.forEach((node: any) => {
    const step: any = {
      data: node.data,
      height: node.height,
      id: node.id,
      position: node.position,
      positionAbsolute: node.positionAbsolute,
      selected: node.selected,
      type: node.type,
      width: node.width,
    };

    if (node.data.nodeType === "conditionNode" || node.data.nodeType === "pixNode") {
      const trueEdge = reactFlowObject.flow.edges.find(
        (edge: any) => edge.source === node.id && edge.sourceHandle == "a"
      );
      const falseEdge = reactFlowObject.flow.edges.find(
        (edge: any) => edge.source === node.id && edge.sourceHandle == "b"
      );

      step.true = trueEdge ? trueEdge : null;
      step.false = falseEdge ? falseEdge : null;

      step.prev = reactFlowObject.flow.edges.find(
        (edge: any) => edge.target === node.id
      );
    } else {
      // Handle common nodes
      step.prev = reactFlowObject.flow.edges.find(
        (edge: any) => edge.target === node.id
      );
      step.next = reactFlowObject.flow.edges.find(
        (edge: any) => edge.source === node.id
      );
    }

    customFormatObject.steps.push(step);
  });

  return customFormatObject;
}

function convertToReactFlowFormat(customFormatObject: any) {
  const reactFlowObject: any = {
    flow: {
      nodes: [],
      edges: [],
      viewport: customFormatObject.viewport,
    },
  };

  customFormatObject.steps.forEach((step: any) => {
    const node = {
      data: step.data,
      height: step.height,
      id: step.id,
      position: step.position,
      positionAbsolute: step.positionAbsolute,
      selected: step.selected,
      type: step.type,
      width: step.width,
    };

    reactFlowObject.flow.nodes.push(node);

    if (step.type === "nodeContainer") {
      if (step.prev) {
        reactFlowObject.flow.edges.push({
          ...step.prev,
          target: step.id,
        });
      }

      if (step.next) {
        reactFlowObject.flow.edges.push({
          ...step.next,
          source: step.id,
        });
      }
    }
  });

  return reactFlowObject;
}

export default Object.freeze({
  convertToCustomFormat,
  convertToReactFlowFormat,
});
