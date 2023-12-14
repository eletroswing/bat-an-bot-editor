import customHighlight from "@/components/customHighlight";
import CustomTexts from "@/components/customTexts";
import { useMouseClick } from "@/components/mouseEventContext";
import React, { useCallback, useEffect, useRef, useState } from "react";

const WebhookNode: React.FC<any> = ({ data, isSelected }) => {
  const [editable, setEditable] = useState(false);
  const [url, setUrl] = useState(data && data.url ? data.url : "Null");

  const [method, setMethod] = useState(
    data && data.method ? data.method : "GET"
  );

  const [headers, setHeaders] = useState(
    data && data.headers ? data.headers : '{"Content-type": "application/json"}'
  );

  const [body, setBody] = useState(data && data.body ? data.body : "{}");

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
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setUrl(evt.target.value);
      const newData = {
        ...data,
        url: evt.target.value,
      };
      data.setData(newData);
    },
    [data]
  );

  const handleMethodChange = useCallback(
    (evt: React.ChangeEvent<HTMLSelectElement>) => {
      setMethod(evt.target.value);
      const newData = {
        ...data,
        method: evt.target.value,
      };
      data.setData(newData);
    },
    [data]
  );

  const handleHeadersChange = useCallback(
    (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
      setHeaders(evt.target.value);
      const newData = {
        ...data,
        headers: evt.target.value,
      };
      data.setData(newData);
    },
    [data]
  );

  const handleBodyChange = useCallback(
    (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
      setBody(evt.target.value);
      const newData = {
        ...data,
        body: evt.target.value,
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
            <input
              autoFocus
              className="text-md rounded-md px-2 py-1 w-full resize-none bg-[#2c2c32]"
              style={{ textAnchor: "middle" }}
              value={url}
              onChange={handleInputChange}
            />
            <h1 className="mt-2 ">Método:</h1>
            <select
              className="text-md rounded-md px-2 py-1 w-full resize-none bg-[#2c2c32]"
              style={{ textAnchor: "middle" }}
              value={method}
              onChange={handleMethodChange}
            >
              <option selected value="GET">
                GET
              </option>
              <option value="POST">POST</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
              <option value="PUT">PUT</option>
            </select>
            <h1 className="mt-2 ">Headers(como JSON):</h1>
            <textarea
              className="text-md rounded-md px-2 py-1 w-full resize-none bg-[#2c2c32] h-[5rem]"
              style={{ textAnchor: "middle" }}
              value={headers}
              onChange={handleHeadersChange}
            />
            <h1 className="mt-2 ">Body(como JSON):</h1>
            <textarea
              className="text-md rounded-md px-2 py-1 w-full resize-none bg-[#2c2c32] h-[5rem]"
              style={{ textAnchor: "middle" }}
              value={body}
              onChange={handleBodyChange}
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
                className="text-blue-500"
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
                  d="m13 3-7.931 9.693c-.342.418-.513.627-.514.803a.5.5 0 0 0 .186.394c.138.11.407.11.947.11H12l-1 7 7.93-9.693c.342-.418.513-.627.514-.803a.5.5 0 0 0-.186-.394C19.12 10 18.85 10 18.31 10H12l1-7Z"
                />
              </svg>
            </div>
            <div>
              <span className="text-md rounded-md px-2 py-1 border-2 border-transparent flex">
                {customHighlight(`URL: ${url}`)}
              </span>
              <span className="text-md rounded-md px-2 py-1 border-2 border-transparent flex">
                {customHighlight(`Metodo: ${method}`)}
              </span>
              <span className="text-md rounded-md px-2 py-1 border-2 border-transparent flex">
                {customHighlight(`Headers: ${headers}`)}
              </span>
              <span className="text-md rounded-md px-2 py-1 border-2 border-transparent flex">
                {customHighlight(`Body: ${body}`)}
              </span>
              <span className="text-md rounded-md px-2 py-1 border-2 border-transparent flex items-center">
                Salve Em: &nbsp; <CustomTexts.yellowText>{variable}</CustomTexts.yellowText>
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default WebhookNode;
