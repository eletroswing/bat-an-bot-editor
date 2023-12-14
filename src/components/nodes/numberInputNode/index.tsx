import customHighlight from "@/components/customHighlight";
import CustomTexts from "@/components/customTexts";
import { useMouseClick } from "@/components/mouseEventContext";
import React, { useCallback, useEffect, useRef, useState } from "react";

const NumberInputNode: React.FC<any> = ({ data, isSelected }) => {
  const [editable, setEditable] = useState(false);
  const [content, setContent] = useState(
    data && data.content ? data.content : "Que tal um ~número~?"
  );

  const [min, setMin] = useState(
    data && data.variable ? data.min : 0
  );
  const [max, setMax] = useState(
    data && data.variable ? data.max : 0
  );
  const [RetryMessage, setRetryMessage] = useState(
    data && data.variable ? data.RetryMessage : "Por favor, insira um número válido."
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

  const handleRetryMessageChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setRetryMessage(evt.target.value);
      const newData = {
        ...data,
        RetryMessage: evt.target.value,
      };
      data.setData(newData);
    },
    [data]
  );

  const handleMinChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setMin(evt.target.value);
      const newData = {
        ...data,
        min: evt.target.value,
      };
      data.setData(newData);
    },
    [data]
  );

  const handleMaxChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setMax(evt.target.value);
      const newData = {
        ...data,
        max: evt.target.value,
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
      <div ref={nodeRef} className="bg-[#1f1f23] rounded-md border border-[#212125] text-sm flex w-full hover:bg-gray-600">
        {editable ? (
          <div className="w-full h-full p-1">
            <textarea
              autoFocus
              className="text-md rounded-md px-2 py-1 w-full h-[10rem] resize-none bg-[#2c2c32]"
              style={{ textAnchor: "middle" }}
              value={content}
              onChange={handleInputChange}
            />
            <h1 className="mt-2 ">Min:</h1>
            <input
              className="text-md rounded-md px-2 py-1 w-full resize-none bg-[#2c2c32] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              type="number"
              style={{ textAnchor: "middle" }}
              value={min}
              onChange={handleMinChange}
            />
            <h1 className="mt-2 ">Max:</h1>
            <input
              className="text-md rounded-md px-2 py-1 w-full resize-none bg-[#2c2c32] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              type="number"
              style={{ textAnchor: "middle" }}
              value={max}
              onChange={handleMaxChange}
            />
            <h1 className="mt-2 ">Erro:</h1>
            <input
              className="text-md rounded-md px-2 py-1 w-full resize-none bg-[#2c2c32]"
              style={{ textAnchor: "middle" }}
              value={RetryMessage}
              onChange={handleRetryMessageChange}
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
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M10.386 1.785a1 1 0 0 1 .884 1.105l-.54 4.86h3.485l.57-5.136a1 1 0 0 1 1.105-.884l.497.055a1 1 0 0 1 .883 1.105l-.54 4.86h3.52a1 1 0 0 1 1 1v.5a1 1 0 0 1-1 1h-3.798l-.389 3.5h4.187a1 1 0 0 1 1 1v.5a1 1 0 0 1-1 1h-4.464l-.571 5.137a1 1 0 0 1-1.104.883l-.498-.055a1 1 0 0 1-.883-1.105l.54-4.86H9.786l-.571 5.137a1 1 0 0 1-1.105.883l-.496-.055a1 1 0 0 1-.884-1.105l.54-4.86H3.75a1 1 0 0 1-1-1v-.5a1 1 0 0 1 1-1h3.798l.389-3.5H3.75a1 1 0 0 1-1-1v-.5a1 1 0 0 1 1-1h4.465l.57-5.136A1 1 0 0 1 9.89 1.73l.496.055Zm3.162 11.965.389-3.5h-3.485l-.389 3.5h3.485Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <span className="text-md rounded-md px-2 py-1 border-2 border-transparent flex">
                {customHighlight(`${content}`)}
              </span>
              <span className="text-md rounded-md px-2 py-1 mt-4 border-2 border-transparent flex">
                {customHighlight(`Min: ${min}`)}
              </span>
              <span className="text-md rounded-md px-2 py-1 mt-4 border-2 border-transparent flex">
                {customHighlight(`Max: ${max}`)}
              </span>
              <span className="text-md rounded-md px-2 py-1 mt-4 border-2 border-transparent flex">
                {customHighlight(`Erro: ${RetryMessage}`)}
              </span>
              <span className="text-md rounded-md px-2 py-1 mt-4 border-2 border-transparent flex items-center">
                Salve em:  &nbsp; <CustomTexts.yellowText>{variable}</CustomTexts.yellowText>
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NumberInputNode;
