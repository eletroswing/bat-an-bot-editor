import CustomHandle from "@/components/customHandle";
import React, { memo } from "react";
import { Position } from "reactflow";

interface StartNodeProps {
  data: any;
  selected: boolean;
}

const StartNode: React.FC<StartNodeProps> = ({ data, selected }) => {
  return (
    <div
      className={`bg-[#18181b] p-4 rounded-md border w-[300px] text-white font-[500] ${
        !selected ? "border-[#242427]" : "border-blue-500"
      }`}
    >
      <div>
        <h1>Start</h1>
      </div>
      <CustomHandle type="source" position={Position.Right} isConnectable={1} />
    </div>
  );
};

export default memo(StartNode);
