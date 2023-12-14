import customHighlight from "@/components/customHighlight";
import { useMouseClick } from "@/components/mouseEventContext";
import React, { useCallback, useEffect, useRef, useState } from "react";

const MessageNode: React.FC<any> = ({ data, isSelected }) => {
  const [editable, setEditable] = useState(false);
  const [content, setContent] = useState(
    data && data.content ? data.content : "Your text here"
  );

  const handleClick = () => {
    setEditable(true);
  };

  const handleBlur = () => {
    setEditable(false);
  };

  const onChange = useCallback(
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
          <textarea
            autoFocus
            className="text-md bg-transparent border-2 border-blue-500 outline-blue-500 rounded-md px-2 py-1 w-full h-[10rem] resize-none"
            style={{ textAnchor: "middle" }}
            value={content}
            onChange={onChange}
          />
        ) : (
          <div className="flex cursor-pointer w-full" onClick={handleClick}>
            <div className="h-full ml-2 mt-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={12}
                height={12}
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                viewBox="0 0 16 16"
                className="text-blue-500"
              >
                <path d="M1.75 14.25V2.75h12.5v8.5h-8.5z" />
              </svg>
            </div>
            <span
              className="text-md rounded-md px-2 py-1 border-2 border-transparent flex"
            >
              {customHighlight(content)}
            </span>
          </div>
        )}
      </div>
    </>
  );
};

export default MessageNode;
