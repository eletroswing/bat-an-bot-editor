import customHighlight from "@/components/customHighlight";
import CustomTexts from "@/components/customTexts";
import { useMouseClick } from "@/components/mouseEventContext";
import React, { useCallback, useEffect, useRef, useState } from "react";

const ConditionNode: React.FC<any> = ({ data, isSelected }) => {
  const [editable, setEditable] = useState(false);
  const [content, setContent] = useState(
    data && data.content ? data.content : "Null"
  );

  const [value, setValue] = useState(
    data && data.value ? data.value : "Maycon"
  );

  const [type, setType] = useState(data && data.type ? data.type : "equals");

  const handleClick = () => {
    setEditable(true);
  };

  const handleBlur = () => {
    setEditable(false);
  };

  const handleInputChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setContent(evt.target.value);
      const newData = {
        ...data,
        content: evt.target.value,
      };
      data.setData(newData);
    },
    [data]
  );

  const handleValueChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setValue(evt.target.value);
      const newData = {
        ...data,
        value: evt.target.value,
      };
      data.setData(newData);
    },
    [data]
  );

  const handleTypeChange = useCallback(
    (evt: React.ChangeEvent<HTMLSelectElement>) => {
      setType(evt.target.value);
      const newData = {
        ...data,
        type: evt.target.value,
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
      <div
        ref={nodeRef}
        className="bg-[#1f1f23] rounded-md border border-[#212125] text-sm flex w-full hover:bg-gray-600 flex-col"
      >
        {editable ? (
          <div className="w-full h-full p-1">
            <input
              autoFocus
              className="text-md rounded-md px-2 py-1 w-full resize-none bg-[#2c2c32]"
              style={{ textAnchor: "middle" }}
              value={content}
              onChange={handleInputChange}
            />
            <h1 className="mt-2 ">Tipo:</h1>
            <select
              className="text-md rounded-md px-2 py-1 w-full resize-none bg-[#2c2c32]"
              style={{ textAnchor: "middle" }}
              value={type}
              onChange={handleTypeChange}
            >
              <option selected value="equals">
                Igual
              </option>
              <option value="contain">Contém</option>
              <option value="dontContain">Não Contém</option>
              <option value="startsWith">Começa com</option>
              <option value="endsWith">Termina com</option>
              <option value="greatherThan">Maior que</option>
              <option value="lessThan">Menor que</option>
              <option value="greatherOrEqual">Maior ou Igual</option>
              <option value="lessOrEqual">Menor ou igual</option>
              <option value="isSet">Tem Valor</option>
              <option value="isEmpty">Está vazio</option>
              <option value="regex">Combina com regex</option>
              <option value="notRegex">Não combina com regex</option>
            </select>
            {new Set<any>(["isSet", "isEmpty"]).has(type) ? (
              <></>
            ) : (
              <>
                <h1 className="mt-2 ">Value:</h1>
                <input
                  className="text-md rounded-md px-2 py-1 w-full resize-none bg-[#2c2c32]"
                  style={{ textAnchor: "middle" }}
                  value={value}
                  onChange={handleValueChange}
                />
              </>
            )}
          </div>
        ) : (
          <div className="flex cursor-pointer w-full" onClick={handleClick}>
            <div className="h-full ml-2 mt-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={15}
                height={15}
                fill="none"
                className="text-blue-500"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4.6c0-.56 0-.84.109-1.054a1 1 0 0 1 .437-.437C3.76 3 4.04 3 4.6 3h14.8c.56 0 .84 0 1.054.109a1 1 0 0 1 .437.437C21 3.76 21 4.04 21 4.6v1.737c0 .245 0 .367-.028.482a.998.998 0 0 1-.12.29c-.061.1-.148.187-.32.36l-6.063 6.062c-.173.173-.26.26-.322.36a.998.998 0 0 0-.12.29c-.027.115-.027.237-.027.482V17l-4 4v-6.337c0-.245 0-.367-.028-.482a1 1 0 0 0-.12-.29c-.061-.1-.148-.187-.32-.36L3.468 7.47c-.173-.173-.26-.26-.322-.36a1 1 0 0 1-.12-.29C3 6.704 3 6.582 3 6.337V4.6Z"
                />
              </svg>
            </div>
            <div>
              <span className="text-md rounded-md px-2 py-1 border-2 border-transparent flex items-center">
                Se: &nbsp;{" "}
                <CustomTexts.yellowText>{content}</CustomTexts.yellowText>
              </span>
              <span className="text-md rounded-md px-2 py-1 border-2 border-transparent flex">
                {customHighlight(`Comparação: ${type}`)}
              </span>
              {new Set<any>(["isSet", "isEmpty"]).has(type) ? (
                <></>
              ) : (
                <>
                  <span className="text-md rounded-md px-2 py-1 border-2 border-transparent flex">
                    {customHighlight(`Valor: ${value}`)}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        <div className="w-full pt-4 justify-center flex">
          <div className="w-full flex justify-center text-green-500">
            <span className="ml-10">Verdadeiro</span>
          </div>
          <div className="w-full flex justify-center text-red-500">
            <span className="mr-10">Falso</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConditionNode;
