import customHighlight from "@/components/customHighlight";
import CustomTexts from "@/components/customTexts";
import { useMouseClick } from "@/components/mouseEventContext";
import React, { useCallback, useEffect, useRef, useState } from "react";

const TextInputNode: React.FC<any> = ({ data, isSelected }) => {
  const [editable, setEditable] = useState(false);
  const [content, setContent] = useState(
    data && data.content ? data.content : "Digite um *pouco* de _texto_:"
  );

  const [variable, setVariable] = useState(
    data && data.variable ? data.variable : "Null"
  );

  const handleClick = () => {
    setEditable(true);
  };

  const handleBlur = () => {
    setEditable(false);
  };

  const handleInputChange = useCallback(
    (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(evt.target.value);
      const newData = {
        ...data,
        content: evt.target.value,
      };
      data.setData(newData);
    },
    [data]
  );

  const handleVariableChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setVariable(evt.target.value);
      const newData = {
        ...data,
        variable: evt.target.value,
      };
      data.setData(newData);
    },
    [data]
  );

  //click outside listener
  const nodeRef = useRef<HTMLDivElement>(null);
  const { addClickListener, removeClickListener } = useMouseClick();
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (nodeRef.current && !nodeRef.current.contains(event.target as Node) && editable) {
        handleBlur();
      }
    };
    addClickListener(handleClick);

    return () => {
      removeClickListener(handleClick);
    };
  }, [addClickListener, removeClickListener, editable]);

  return (
    <>
      <div
        ref={nodeRef}
        className="bg-[#1f1f23] rounded-md border border-[#212125] text-sm flex w-full hover:bg-gray-600"
      >
        {editable ? (
          <div className="w-full h-full p-1">
            <textarea
              autoFocus
              className="text-md rounded-md px-2 py-1 w-full h-[10rem] resize-none bg-[#2c2c32]"
              style={{ textAnchor: "middle" }}
              value={content}
              onChange={handleInputChange}
            />
            <h1 className="mt-2 ">Salve em:</h1>
            <input
              className="text-md rounded-md px-2 py-1 w-full resize-none bg-[#2c2c32]"
              style={{ textAnchor: "middle" }}
              value={variable}
              onChange={handleVariableChange}
            />
          </div>
        ) : (
          <div className="flex cursor-pointer w-full" onClick={handleClick}>
            <div className="h-full ml-2 mt-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={12}
                height={12}
                fill="none"
                className="text-[#f7a04b]"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v18m-3 0h6m4-15V3H5v3"
                />
              </svg>
            </div>
            <div>
              <span className="text-md rounded-md px-2 py-1 border-2 border-transparent flex">
                {customHighlight(`${content}`)}
              </span>
              <span className="text-md rounded-md px-2 py-1 mt-4 border-2 border-transparent flex items-center">
                Salve Em: &nbsp; <CustomTexts.yellowText>{variable}</CustomTexts.yellowText>
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TextInputNode;
