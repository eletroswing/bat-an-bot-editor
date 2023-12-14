import customHighlight from "@/components/customHighlight";
import CustomTexts from "@/components/customTexts";
import { useMouseClick } from "@/components/mouseEventContext";
import React, { useCallback, useEffect, useRef, useState } from "react";

const CartNode: React.FC<any> = ({ data, isSelected }) => {
  const [editable, setEditable] = useState(false);
  const [item, setItem] = useState(data && data.item ? data.item : "Null");

  const [quantity, setQuantity] = useState(
    data && data.quantity ? data.quantity : 0
  );

  const [value, setValue] = useState(data && data.value ? data.value : 0.0);

  const [type, setType] = useState(data && data.type ? data.type : "add");

  const handleClick = () => {
    setEditable(true);
  };

  const handleBlur = () => {
    setEditable(false);
  };

  const handleInputChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setItem(evt.target.value);
      const newData = {
        ...data,
        item: evt.target.value,
      };
      data.setData(newData);
    },
    [data]
  );

  const handleQuantityChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setQuantity(evt.target.value);
      const newData = {
        ...data,
        quantity: evt.target.value,
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
        className="bg-[#1f1f23] rounded-md border border-[#212125] text-sm flex w-full hover:bg-gray-600"
      >
        {editable ? (
          <div className="w-full h-full p-1">
            <input
              autoFocus
              className="text-md rounded-md px-2 py-1 w-full resize-none bg-[#2c2c32]"
              style={{ textAnchor: "middle" }}
              value={item}
              onChange={handleInputChange}
            />
            <h1 className="mt-2 ">Quantidade:</h1>
            <input
              className="text-md rounded-md px-2 py-1 w-full resize-none bg-[#2c2c32] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              style={{ textAnchor: "middle" }}
              type="number"
              min={0}
              value={quantity}
              onChange={handleQuantityChange}
            />
            <h1 className="mt-2 ">Tipo:</h1>
            <select
              className="text-md rounded-md px-2 py-1 w-full resize-none bg-[#2c2c32]"
              style={{ textAnchor: "middle" }}
              value={type}
              onChange={handleTypeChange}
            >
              <option selected value="add">
                Adicionar
              </option>
              <option value="remove">Remover</option>
            </select>
            {type == "add" && (
              <>
                <h1 className="mt-2 ">Valor:</h1>
                <input
                  className="text-md rounded-md px-2 py-1 w-full resize-none bg-[#2c2c32] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min={0.0}
                  type="number"
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
                className="text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                width={15}
                height={15}
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m21 5-2 7H7.377M20 16H8L6 3H3m8 3 2 2 4-4M9 20a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm11 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
                />
              </svg>
            </div>
            <div>
              <span className="text-md rounded-md px-2 py-1 border-2 border-transparent flex">
                {customHighlight(`Item: ${item}`)}
              </span>
              <span className="text-md rounded-md px-2 py-1 border-2 border-transparent flex">
                {customHighlight(`Quantidade: ${quantity}`)}
              </span>
              <span className="text-md rounded-md px-2 py-1 border-2 border-transparent flex">
                {customHighlight(`Tipo: ${type}`)}
              </span>
              {type == "add" && (
                <span className="text-md rounded-md px-2 py-1 border-2 border-transparent flex">
                  {customHighlight(`Valor unitário: ${value}`)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartNode;
