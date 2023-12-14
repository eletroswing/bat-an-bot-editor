import customHighlight from "@/components/customHighlight";
import { useMouseClick } from "@/components/mouseEventContext";
import React, { useCallback, useEffect, useRef, useState } from "react";

const MessageToNode: React.FC<any> = ({ data, isSelected }) => {
  const [editable, setEditable] = useState(false);
  const [content, setContent] = useState(
    data && data.content
      ? data.content
      : "Olá, uma compra foi feita em {{nome}}, no contato {{message-author-number}}"
  );

  const [number, setNumber] = useState(
    data && data.number ? data.number : "55(99)99999-9999"
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

  const handleNumberChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setNumber(evt.target.value);
      const newData = {
        ...data,
        number: evt.target.value,
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
      if (
        nodeRef.current &&
        !nodeRef.current.contains(event.target as Node) &&
        editable
      ) {
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
            <h1 className="mt-2 ">Para:</h1>
            <input
              className="text-md rounded-md px-2 py-1 w-full resize-none bg-[#2c2c32]"
              style={{ textAnchor: "middle" }}
              value={number}
              onChange={handleNumberChange}
            />
            <h1 className="mt-2 ">Mensagem:</h1>
            <textarea
              autoFocus
              className="text-md rounded-md px-2 py-1 w-full h-[10rem] resize-none bg-[#2c2c32]"
              style={{ textAnchor: "middle" }}
              value={content}
              onChange={handleInputChange}
            />
          </div>
        ) : (
          <div className="flex cursor-pointer w-full" onClick={handleClick}>
            <div className="h-full ml-2 mt-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={15}
                height={15}
                className="text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeWidth={1.5}
                  d="M17 12a5 5 0 1 0-4.478-2.774.817.817 0 0 1 .067.574l-.298 1.113a.65.65 0 0 0 .796.796l1.113-.298a.817.817 0 0 1 .574.067A4.98 4.98 0 0 0 17 12Z"
                />
                <path
                  fill="currentColor"
                  d="m14.1 16.027.545.517-.544-.517Zm.456-.48-.544-.516.544.517Zm2.417-.335-.374.65.374-.65Zm1.91 1.1-.374.65.374-.65Zm.539 3.446.543.517-.543-.517Zm-1.42 1.496-.545-.517.544.517Zm-1.326.71.074.745-.074-.746Zm-9.86-4.489.543-.516-.544.516Zm-4.064-9.55a.75.75 0 1 0-1.498.081l1.498-.08Zm5.439 1.88.544.517-.544-.517Zm.287-.302.543.517-.543-.517Zm.156-2.81.613-.433-.613.433ZM7.374 4.91l-.613.433.612-.433Zm-3.656-.818a.75.75 0 0 0 1.087 1.033L3.718 4.092Zm6.345 9.964.544-.517-.544.517Zm-.399 6.756a.75.75 0 1 0 .798-1.27l-.798 1.27Zm4.449.246a.75.75 0 0 0-.307 1.469l.307-1.469Zm.532-4.514.455-.48-1.088-1.033-.455.48 1.088 1.033Zm1.954-.682 1.91 1.1.748-1.3-1.91-1.1-.748 1.3Zm2.279 3.38-1.42 1.495 1.087 1.034 1.42-1.496-1.087-1.033ZM7.359 16.959c-3.876-4.081-4.526-7.523-4.607-9.033l-1.498.08c.1 1.85.884 5.634 5.018 9.986l1.087-1.033Zm1.376-6.637.286-.302-1.087-1.033-.287.302 1.088 1.033Zm.512-4.062L7.986 4.477l-1.225.866 1.26 1.783 1.226-.866ZM8.19 9.805c-.544-.516-.545-.516-.545-.515l-.002.002-.003.003a.674.674 0 0 0-.05.058 1.592 1.592 0 0 0-.23.427c-.098.275-.15.639-.084 1.093.13.892.715 2.091 2.242 3.7l1.088-1.034c-1.428-1.503-1.78-2.428-1.846-2.884-.032-.22 0-.335.013-.372l.008-.019a.265.265 0 0 1-.037.047l-.005.005a.05.05 0 0 1-.003.003l-.001.001s-.001.002-.545-.515Zm1.328 4.767c1.523 1.604 2.673 2.234 3.55 2.377.451.073.816.014 1.092-.095a1.52 1.52 0 0 0 .421-.25l.036-.034.014-.014.007-.006.003-.003.001-.002s.002-.001-.542-.518c-.544-.516-.543-.517-.543-.518l.002-.001.002-.003.006-.005a.811.811 0 0 1 .047-.042c.009-.006.008-.004-.005.001-.02.008-.11.04-.3.009-.402-.066-1.27-.42-2.703-1.929l-1.088 1.033ZM7.986 4.477C6.972 3.043 4.944 2.8 3.718 4.092l1.087 1.033c.523-.55 1.444-.507 1.956.218l1.225-.866Zm9.471 16.26c-.279.294-.57.452-.854.48l.147 1.492c.747-.073 1.352-.472 1.795-.939l-1.088-1.032ZM9.021 10.02C9.99 9 10.057 7.407 9.247 6.26l-1.225.866c.422.597.357 1.392-.088 1.86L9.02 10.02Zm9.488 6.942c.821.473.982 1.635.369 2.28l1.087 1.033c1.305-1.374.925-3.673-.707-4.613l-.749 1.3Zm-3.409-.898c.385-.406.986-.497 1.499-.202l.748-1.3c-1.099-.632-2.46-.45-3.335.47l1.088 1.032Zm-4.638 3.478c-.984-.618-2.03-1.454-3.103-2.583l-1.087 1.033c1.154 1.215 2.297 2.132 3.392 2.82l.798-1.27Zm6.14 1.675a8.269 8.269 0 0 1-2.489-.159l-.307 1.469a9.768 9.768 0 0 0 2.944.182l-.147-1.492Z"
                />
              </svg>
            </div>
            <div>
              <span className="text-md rounded-md px-2 py-1 border-2 border-transparent flex">
                {customHighlight(`Para: ${number}`)}
              </span>
              <span className="text-md rounded-md px-2 py-1 mt-4 border-2 border-transparent flex">
                {customHighlight(`Mensagem: ${content}`)}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MessageToNode;
