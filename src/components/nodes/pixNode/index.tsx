import customHighlight from "@/components/customHighlight";
import CustomTexts from "@/components/customTexts";
import { useMouseClick } from "@/components/mouseEventContext";
import React, { useCallback, useEffect, useRef, useState } from "react";

const PixNode: React.FC<any> = ({ data, isSelected }) => {
  const [editable, setEditable] = useState(false);

  const [key, setKey] = useState(data && data.key ? data.key : "sua-chave");

  const [keyType, setKeyType] = useState(
    data && data.keyType ? data.keyType : "CPF"
  );

  const [value, setValue] = useState(data && data.value ? data.value : 0.0);

  const [description, setDescription] = useState(
    data && data.description ? data.description : "Pagamento do churras!"
  );

  const handleClick = () => {
    setEditable(true);
  };

  const handleBlur = () => {
    setEditable(false);
  };

  const handleInputChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setKey(evt.target.value);
      const newData = {
        ...data,
        key: evt.target.value,
      };
      data.setData(newData);
    },
    [data]
  );

  const handleKeyTypeChange = useCallback(
    (evt: React.ChangeEvent<HTMLSelectElement>) => {
      setKeyType(evt.target.value);
      const newData = {
        ...data,
        keyType: evt.target.value,
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

  const handleDescriptionChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setDescription(evt.target.value);
      const newData = {
        ...data,
        description: evt.target.value,
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
      <div ref={nodeRef} className="bg-[#1f1f23] rounded-md border border-[#212125] text-sm flex w-full hover:bg-gray-600 flex-col">
        {editable ? (
          <div className="w-full h-full p-1">
            <input
            autoFocus
              className="text-md rounded-md px-2 py-1 w-full resize-none bg-[#2c2c32]"
              style={{ textAnchor: "middle" }}
              value={key}
              onChange={handleInputChange}
            />
            <h1 className="mt-2 ">Tipo da chave:</h1>
            <select
              className="text-md rounded-md px-2 py-1 w-full resize-none bg-[#2c2c32]"
              style={{ textAnchor: "middle" }}
              value={keyType}
              onChange={handleKeyTypeChange}
            >
              <option selected value="CPF">
                CPF
              </option>
              <option value="NUMBER">Telefone</option>
              <option value="EMAIL">Email</option>
              <option value="RANDOM">Aleatório</option>
              <option value="CNPJ">Cnpj</option>
            </select>
            <h1 className="mt-2 ">Valor:</h1>
            <input
              type="number"
              className="text-md rounded-md px-2 py-1 w-full resize-none bg-[#2c2c32] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              style={{ textAnchor: "middle" }}
              value={value}
              onChange={handleValueChange}
            />
            <h1 className="mt-2 ">Descrição:</h1>
            <input
              className="text-md rounded-md px-2 py-1 w-full resize-none bg-[#2c2c32]"
              style={{ textAnchor: "middle" }}
              value={description}
              onChange={handleDescriptionChange}
            />
          </div>
        ) : (
          <div className="flex cursor-pointer w-full" onClick={handleClick}>
            <div className="h-full ml-2 mt-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="text-blue-500"
                width={20}
                height={20}
                viewBox="0 0 16 16"
              >
                <path
                  fill="currentColor"
                  d="M11.917 11.71a2.046 2.046 0 0 1-1.454-.602l-2.1-2.1a.4.4 0 0 0-.551 0l-2.108 2.108a2.044 2.044 0 0 1-1.454.602h-.414l2.66 2.66c.83.83 2.177.83 3.007 0l2.667-2.668h-.253zM4.25 4.282c.55 0 1.066.214 1.454.602l2.108 2.108a.39.39 0 0 0 .552 0l2.1-2.1a2.044 2.044 0 0 1 1.453-.602h.253L9.503 1.623a2.127 2.127 0 0 0-3.007 0l-2.66 2.66h.414z"
                />
                <path
                  fill="currentColor"
                  d="m14.377 6.496-1.612-1.612a.307.307 0 0 1-.114.023h-.733c-.379 0-.75.154-1.017.422l-2.1 2.1a1.005 1.005 0 0 1-1.425 0L5.268 5.32a1.448 1.448 0 0 0-1.018-.422h-.9a.306.306 0 0 1-.109-.021L1.623 6.496c-.83.83-.83 2.177 0 3.008l1.618 1.618a.305.305 0 0 1 .108-.022h.901c.38 0 .75-.153 1.018-.421L7.375 8.57a1.034 1.034 0 0 1 1.426 0l2.1 2.1c.267.268.638.421 1.017.421h.733c.04 0 .079.01.114.024l1.612-1.612c.83-.83.83-2.178 0-3.008z"
                />
              </svg>
            </div>
            <div>
              <span className="text-md rounded-md px-2 py-1 border-2 border-transparent flex">
                {customHighlight(`Chave: ${key}`)}
              </span>
              <span className="text-md rounded-md px-2 py-1 mt-4 border-2 border-transparent flex">
                {customHighlight(`Tipo: ${keyType}`)}
              </span>
              <span className="text-md rounded-md px-2 py-1 mt-4 border-2 border-transparent flex">
                {customHighlight(`Valor: ${value}`)}
              </span>
              <span className="text-md rounded-md px-2 py-1 mt-4 border-2 border-transparent flex">
                {customHighlight(`Descrição: ${description}`)}
              </span>
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

export default PixNode;
