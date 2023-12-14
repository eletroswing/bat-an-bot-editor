import React, { useCallback, useState, memo } from "react";
import { Handle, NodeToolbar, Position } from "reactflow";
import nodeManager from "@/components/nodes/nodeManager";
import { randomBytes } from "crypto";

interface NodeContainerProps {
  data: any;
  selected: boolean;
}

const NodeContainer: React.FC<NodeContainerProps> = ({ data, selected }) => {
  const [editable, setEditable] = useState(false);
  const [title, setTitle] = useState(data.label);
  const Child: any = (nodeManager[data.nodeType] as React.FC) || (() => <></>);

  const handleClick = () => {
    setEditable(true);
  };

  const handleBlur = () => {
    setEditable(false);
  };

  const onChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(evt.target.value);
      const newData = {
        ...data,
        label: evt.target.value,
      };
      data.setData(newData);
    },
    [data]
  );

  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top}>
        <div className="flex justify-end">
          <div className="bg-[#27272a] hover:bg-[#333337] border border-[#48484b] text-white rounded-lg flex">
            <button
              className="p-2 w-full h-full"
              onClick={(e) => data.deleteSelf()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={20}
                height={20}
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 6v10.2c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C15.72 21 14.88 21 13.2 21h-2.4c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C6 18.72 6 17.88 6 16.2V6M4 6h16m-4 0-.27-.812c-.263-.787-.394-1.18-.637-1.471a2 2 0 0 0-.803-.578C13.938 3 13.524 3 12.694 3h-1.388c-.829 0-1.244 0-1.596.139a2 2 0 0 0-.803.578c-.243.29-.374.684-.636 1.471L8 6"
                />
              </svg>
            </button>
          </div>
        </div>
      </NodeToolbar>
      <div
        className={`bg-[#18181b] p-4 rounded-md border w-[300px] text-white font-[500] ${
          !selected ? "border-[#242427]" : "border-blue-500"
        }`}
      >
        {new Set(["marker"]).has(data.nodeType) ? (
          <></>
        ) : (
          <Handle
            type="target"
            position={Position.Left}
            style={{
              background: "#3f3f46",
              width: ".8rem",
              height: ".8rem",
              boxShadow: "inset 0 0 0 .1rem white, 0 0 0 .2rem #3f3f46",
            }}
          />
        )}
        <div>
          <div>
            {editable ? (
              <input
                type="text"
                autoFocus
                className="text-md bg-transparent border-2 border-blue-500 outline-blue-500 rounded-md px-2 py-1 w-full"
                style={{ textAnchor: "middle" }}
                value={title}
                onChange={onChange}
                onBlur={handleBlur}
              />
            ) : (
              <span
                className="text-md font-bold hover:bg-gray-600 rounded-md px-2 py-1 border-2 border-transparent flex"
                onClick={handleClick}
              >
                {title}
              </span>
            )}
          </div>
          <Child data={data} />
        </div>
        {data.nodeType == "jumpNode" ? (
          <></>
        ) : (data.nodeType == "conditionNode" || data.nodeType == "pixNode") ? (
          <>
            <Handle
              type="source"
              position={Position.Bottom}
              id="a"
              style={{
                background: "#3f3f46",
                width: ".8rem",
                height: ".8rem",
                left: "35%",
                boxShadow: "inset 0 0 0 .1rem white, 0 0 0 .2rem #3f3f46",
              }}
            />
            <Handle
              type="source"
              position={Position.Bottom}
              id="b"
              style={{
                background: "#3f3f46",
                width: ".8rem",
                height: ".8rem",
                left: "65%",
                boxShadow: "inset 0 0 0 .1rem white, 0 0 0 .2rem #3f3f46",
              }}
            />
          </>
        ) : (
          <Handle
            type="source"
            position={Position.Right}
            style={{
              background: "#3f3f46",
              width: ".8rem",
              height: ".8rem",
              boxShadow: "inset 0 0 0 .1rem white, 0 0 0 .2rem #3f3f46",
            }}
          />
        )}
      </div>
    </>
  );
};

export default memo(NodeContainer);
