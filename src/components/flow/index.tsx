/* eslint-disable react/no-unescaped-entities */
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  BackgroundVariant,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  getOutgoers,
} from "reactflow";

import "reactflow/dist/style.css";
import nodeContainer from "@/components/nodes/nodeContainer";
import startNode from "@/components/nodes/startNode";
import { ClickProvider } from "../mouseEventContext";
import { randomBytes } from "crypto";
import customHighlight from "../customHighlight";
import flowConversion from "@/utils/flowConversion";

const initialNodes = [
  {
    id: "-1",
    position: { x: 500, y: 500 },
    data: { label: "Start" },
    type: "startNode",
  },
];
const initialEdges: any[] = [];

const localStorageKey = "flow-development-save-key";

const getId = () => `${randomBytes(32).toString("hex")}`;

const edgeStylingOptions = {
  type: "smoothstep",
};

function Graph() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { setViewport, zoomIn, zoomOut, getNodes, getEdges } = useReactFlow();
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedElements, setSelectedElements] = useState<any[]>([]);

  const nodeTypes = useMemo(
    () => ({ nodeContainer: nodeContainer, startNode: startNode }),
    []
  );

  //redo and undo start here
  const [history, setHistory] = useState<any[]>([
    { nodes: initialNodes, edges: initialEdges },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const saveHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, { nodes: nodes, edges: edges }]);
    setHistoryIndex(newHistory.length);
  }, [edges, history, historyIndex, nodes]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const { nodes: prevNodes, edges: prevEdges } = history[historyIndex - 1];
      setNodes(prevNodes);
      setEdges(prevEdges);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (history[historyIndex + 1]) {
      setHistoryIndex(historyIndex + 1);
      const { nodes: nextNodes, edges: nextEdges } = history[historyIndex + 1];
      setNodes(nextNodes);
      setEdges(nextEdges);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  //D-N-D node creation starts here

  const onNodeClick = useCallback(
    (event: any, node: any) => {
      setSelectedElements([node]);
      setNodes((nodes) =>
        nodes.map((n) => ({
          ...n,
          selected: n.id === node.id,
        }))
      );
    },
    [setNodes]
  );

  const setData = useCallback(
    (id: any) => (data: any) => {
      data.setData = setData(id);
      setNodes((nodes) =>
        nodes.map((n) => (n.id === id ? { ...n, data: { ...data } } : n))
      );
    },
    [setNodes]
  );

  const deleteNode = useCallback(
    (id: any) => () => {
      setNodes((nodes) => nodes.filter((n) => n.id !== id));
      setEdges((edges) =>
        edges.filter((e) => e.target !== id && e.source !== id)
      );
    },
    [setEdges, setNodes]
  );

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData("application/reactflow");

      if (!nodeType) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const id = getId();
      const newNode = {
        id,
        type: "nodeContainer",
        position,
        data: {
          label: `${nodeType} #${nodes.length}`,
          nodeType: nodeType,
          setData: setData(id),
          deleteSelf: deleteNode(id),
        },
      };

      setNodes((nds) => [...nds, newNode]);
      saveHistory();
    },
    [
      reactFlowInstance,
      nodes.length,
      setData,
      deleteNode,
      setNodes,
      saveHistory,
    ]
  );

  const onPaneClick = useCallback(() => {
    setSelectedElements([]);
    setNodes((nodes) =>
      nodes.map((n) => ({
        ...n,
        selected: false,
      }))
    );
  }, [setNodes]);

  const onDragStart = (event: any, nodeType: any) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  //save and restore flow
  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const savedDataString = localStorage.getItem(localStorageKey);
      if (savedDataString) {
        const data = JSON.parse(savedDataString);
        const flow = data.flow;

        if (flow) {
          const { nodes: savedNodes = [], edges: savedEdges = [] } = flow;

          const { x = 0, y = 0, zoom = 1 } = flow.viewport;

          setViewport({ x, y, zoom });
          setNodes(savedNodes);
          setNodes((nodes) =>
            nodes.map((n: any) => {
              n.data.setData = setData(n.id);
              n.data.deleteSelf = deleteNode(n.id);
              return n;
            })
          );

          setEdges(savedEdges);
        }
      }
    };

    restoreFlow();
  }, [deleteNode, setData, setEdges, setNodes, setViewport]);

  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      const objToSave = {
        flow,
      };
      localStorage.setItem(localStorageKey, JSON.stringify(objToSave));
      alert("Save successful!");
    }
  }, [reactFlowInstance]);

  const getFlowData = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      const objToSave = {
        flow,
      };

      return objToSave;
    }
  }, [reactFlowInstance]);

  //set shortcuts
  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.ctrlKey && event.key === "z") {
        undo();
        event.preventDefault();
      }

      if (event.ctrlKey && event.key === "y") {
        redo();
        event.preventDefault();
      }

      if (event.ctrlKey && event.key === "s") {
        onSave();
        event.preventDefault();
      }

      if (event.ctrlKey && event.shiftKey && event.key === "S") {
        onRestore();
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo, onSave, onRestore]);

  //prevent cycles
  const isValidConnection = useCallback(
    (connection: any) => {
      const nodes = getNodes();
      const edges = getEdges();
      const target: any = nodes.find((node) => node.id === connection.target);
      const hasCycle = (node: any, visited = new Set()) => {
        if (visited.has(node.id)) return false;

        visited.add(node.id);

        for (const outgoer of getOutgoers(node, nodes, edges)) {
          if (outgoer.id === connection.source) return true;
          if (hasCycle(outgoer, visited)) return true;
        }
      };

      if (target.id === connection.source) return false;
      return !hasCycle(target);
    },
    [getEdges, getNodes]
  );

  const flowRef = useRef<HTMLDivElement>(null);
  const addNode = useCallback(
    (nodeType: string = "NONE") => {
      const position = reactFlowInstance.screenToFlowPosition({
        x: flowRef.current!.clientWidth / 2,
        y: flowRef.current!.clientHeight / 2,
      });

      const id = getId();
      const newNode = {
        id,
        type: "nodeContainer",
        position,
        data: {
          label: `${nodeType} #${nodes.length}`,
          nodeType: nodeType,
          setData: setData(id),
          deleteSelf: deleteNode(id),
        },
      };

      setNodes((nds) => [...nds, newNode]);
      saveHistory();
    },
    [
      deleteNode,
      nodes.length,
      reactFlowInstance,
      saveHistory,
      setData,
      setNodes,
    ]
  );

  //collapse lateral panel
  const [isHidable, setIsHidable] = useState(false);
  const [isHide, setIsHide] = useState(false);

  useEffect(() => {
    if (!flowRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      if (flowRef.current!.offsetWidth <= 800) {
        setIsHidable(true);
      } else {
        setIsHidable(false);
      }
    });
    resizeObserver.observe(flowRef.current);
    return () => resizeObserver.disconnect(); // clean up
  }, [isHidable]);

  //testing
  const messagesContainer = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [showTestModal, setShowTestModal] = React.useState(false);
  const [messages, setMessages] = React.useState<
    { side: "left" | "right" | "center"; message: string; date: string }[]
  >([]);

  const startTesting = React.useCallback(() => {
    setShowTestModal(true);
  }, []);

  const addMessage = React.useCallback(
    (side: "left" | "right" | "center", content: string, date: string) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { side, message: content, date },
      ]);
    },
    []
  );

  useEffect(() => {
    const scrollToBottom = () => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    scrollToBottom();
  }, [messages]);

  const inputMessageRef = useRef<HTMLInputElement>(null);

  //engine ----- internal funcionality to this systens work
  const [stage, setStage] = useState<number | null>(null);
  var flowSteps: any = useRef<any>({});
  const userState = useMemo(() => new Map(), []);

  const formatedCurrentTime = () => {
    const currentTime = new Date();
    const hours = currentTime.getHours().toString().padStart(2, "0");
    const minutes = currentTime.getMinutes().toString().padStart(2, "0");
    const formatted = `${hours}:${minutes}`;
    return formatted;
  };

  const replaceVarIntoString = useCallback(
    (content: string, defaultContent: string) => {
      const regex = /\{\{(.*?)\}\}/g;
      var messageToSend = content || defaultContent;
      const findVarName = (content || defaultContent).match(regex);
      findVarName?.forEach((varName) => {
        if (varName == "Null") return;
        varName = varName
          .replace(new RegExp("{", "g"), "")
          .replace(new RegExp("}", "g"), "");
        const varInState = userState.get(varName);
        messageToSend = messageToSend.replace(
          new RegExp(`{{${varName}}}`, "g"),
          varInState
        );
      });

      const length = (content || defaultContent).match(regex)?.length;

      if (length && length > 0) {
        return replaceVarIntoString(messageToSend, defaultContent);
      }

      return messageToSend;
    },
    [userState]
  );

  const awaitTime = async (timeMs: number = 100) => {
    await new Promise((r) => setTimeout(() => r(true), timeMs));
  };

  const processNode = useCallback(
    async (
      node: any,
      message: null | string = null,
      currentStep: number = 0
    ) => {
      const regex = /\{\{(.*?)\}\}/g;
      var callNext = false;
      var nextStage = currentStep;
      var reset = false;
      var matchRegex;
      var workingMessage = message;

      const findNext = (next: number | null = null) => {
        const nextNodeStage =
          next || node.next
            ? flowSteps.current.steps.findIndex(
                (item: any) => item.id === node.next.target
              )
            : null;

        callNext = Boolean(nextNodeStage && nextNodeStage >= 0);
        nextStage = nextNodeStage ?? stage;
        reset = !callNext;
      };

      const findNextByName = (
        name: string | null = null,
        next: number | null = null
      ) => {
        if (!name) return;
        const nextNodeStage =
          next ||
          flowSteps.current.steps.findIndex(
            (item: any) =>
              item.data.label === name && item.data.nodeType == "marker"
          );

        callNext = Boolean(nextNodeStage && nextNodeStage >= 0);
        nextStage = nextNodeStage ?? stage;
        reset = !callNext;
      };

      const findNextById = (
        id: string | null = null,
        next: number | null = null
      ) => {
        if (!id) return;
        const nextNodeStage =
          next ||
          flowSteps.current.steps.findIndex((item: any) => item.id == id);

        callNext = Boolean(nextNodeStage && nextNodeStage >= 0);
        nextStage = nextNodeStage ?? stage;
        reset = !callNext;
      };

      switch (node.type) {
        case "startNode":
          findNext();
          break;
        case "nodeContainer":
          switch (node.data.nodeType) {
            case "messageNode":
              const newMessage = replaceVarIntoString(
                node.data.content,
                "Your text here"
              );
              addMessage("left", newMessage, formatedCurrentTime());
              findNext();
              break;

            case "textInputNode":
              if (workingMessage) {
                const varName = replaceVarIntoString(
                  node.data.variable,
                  "Null"
                );
                userState.set(varName, workingMessage);

                workingMessage = null;
                findNext();
              } else {
                const newMessage = replaceVarIntoString(
                  node.data.content,
                  "Digite um *pouco* de _texto_:"
                );
                addMessage("left", newMessage, formatedCurrentTime());
              }
              break;

            case "numberInputNode":
              matchRegex = /[0-9,\.]/g;
              if (workingMessage) {
                if (
                  matchRegex.exec(workingMessage) &&
                  Number(workingMessage) >= Number(node.data.min || 0) &&
                  Number(workingMessage) <= Number(node.data.max || 0)
                ) {
                  const varName = replaceVarIntoString(
                    node.data.variable,
                    "Null"
                  );
                  userState.set(varName, workingMessage);
                  workingMessage = null;

                  findNext();
                } else {
                  const newMessage = replaceVarIntoString(
                    node.data.RetryMessage,
                    "Por favor, insira um número válido."
                  );
                  addMessage("left", newMessage, formatedCurrentTime());
                }
              } else {
                const newMessage = replaceVarIntoString(
                  node.data.content,
                  "Que tal um ~número~?"
                );
                addMessage("left", newMessage, formatedCurrentTime());
              }
              break;

            case "emailInputNode":
              matchRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (workingMessage) {
                if (matchRegex.exec(workingMessage)) {
                  const varName = replaceVarIntoString(
                    node.data.variable,
                    "Null"
                  );
                  userState.set(varName, workingMessage);
                  workingMessage = null;

                  findNext();
                } else {
                  const newMessage = replaceVarIntoString(
                    node.data.RetryMessage,
                    "O valor informado não se parece com um email."
                  );
                  addMessage("left", newMessage, formatedCurrentTime());
                }
              } else {
                const newMessage = replaceVarIntoString(
                  node.data.content,
                  "Um email, por favor:"
                );
                addMessage("left", newMessage, formatedCurrentTime());
              }
              break;

            case "regexInputNode":
              if (workingMessage) {
                matchRegex = new RegExp(
                  node.data.regex || "^d{2}sd{4,5}-d{4}$"
                );
                if (matchRegex.exec(workingMessage)) {
                  const varName = replaceVarIntoString(
                    node.data.variable,
                    "Null"
                  );
                  userState.set(varName, workingMessage);
                  workingMessage = null;

                  findNext();
                } else {
                  const newMessage = replaceVarIntoString(
                    node.data.RetryMessage,
                    "O valor informado não bate com (xx) xxxxx-xxxx."
                  );
                  addMessage("left", newMessage, formatedCurrentTime());
                }
              } else {
                const newMessage = replaceVarIntoString(
                  node.data.content,
                  "Insira um valor"
                );
                addMessage("left", newMessage, formatedCurrentTime());
              }
              break;

            case "jumpNode":
              const varName = replaceVarIntoString(
                node.data.variable,
                "Coleta de Informações"
              );

              findNextByName(varName.replace(/\+/g, ""));
              break;

            case "marker":
              findNext();
              break;

            case "waitInputNode":
              const value =
                Number(node.data.value) > 0
                  ? Number(node.data.value) * 1000
                  : 10 * 1000;
              await awaitTime(value);
              findNext();
              break;

            case "setVariableLogicNode":
              const varN = replaceVarIntoString(node.data.content, "Null");
              const type = node.data.type || "empty";
              const valueToSave: any = replaceVarIntoString(
                node.data.value,
                ""
              );
              let beforeValue = null;
              switch (type) {
                case "empty":
                  userState.set(varN, undefined);
                  break;
                case "custom":
                  userState.set(varN, valueToSave);
                  break;
                case "add":
                  beforeValue = userState.get(varN);
                  if (beforeValue) {
                    if (isNaN(beforeValue) || isNaN(valueToSave)) {
                      userState.set(varN, `${beforeValue}${valueToSave}`);
                    } else {
                      userState.set(
                        varN,
                        Number(beforeValue) + Number(valueToSave)
                      );
                    }
                  } else {
                    userState.set(varN, valueToSave);
                  }
                  break;
                case "subtract":
                  beforeValue = userState.get(varN);
                  if (beforeValue) {
                    if (isNaN(beforeValue) || isNaN(valueToSave)) {
                      beforeValue = beforeValue.replace(
                        new RegExp(valueToSave, "g"),
                        " "
                      );
                      userState.set(varN, `${beforeValue}`);
                    } else {
                      userState.set(
                        varN,
                        Number(beforeValue) - Number(valueToSave)
                      );
                    }
                  } else {
                    userState.set(varN, valueToSave);
                  }
                  break;
                case "multiply":
                  beforeValue = userState.get(varN);
                  if (beforeValue) {
                    if (isNaN(beforeValue) && isNaN(valueToSave)) {
                      userState.set(varN, `${beforeValue}${valueToSave}`);
                    } else {
                      if (isNaN(beforeValue)) {
                        userState.set(
                          varN,
                          beforeValue.repeat(parseInt(valueToSave, 10))
                        );
                      } else {
                        userState.set(
                          varN,
                          valueToSave.repeat(parseInt(beforeValue, 10))
                        );
                      }
                    }
                  } else {
                    userState.set(varN, valueToSave);
                  }
                  break;
                case "divide":
                  beforeValue = userState.get(varN);
                  if (beforeValue) {
                    if (isNaN(beforeValue) || isNaN(valueToSave)) {
                      userState.set(varN, `${beforeValue}${valueToSave}`);
                    } else {
                      userState.set(
                        varN,
                        Number(beforeValue) <= 0 || Number(valueToSave) <= 0
                          ? 0
                          : Number(beforeValue) / Number(valueToSave)
                      );
                    }
                  } else {
                    userState.set(varN, valueToSave);
                  }
                  break;
                case "rest":
                  beforeValue = userState.get(varN);
                  if (beforeValue) {
                    if (isNaN(beforeValue) || isNaN(valueToSave)) {
                      userState.set(varN, `${beforeValue}${valueToSave}`);
                    } else {
                      userState.set(
                        varN,
                        Number(beforeValue) <= 0 || Number(valueToSave) <= 0
                          ? 0
                          : Number(beforeValue) % Number(valueToSave)
                      );
                    }
                  } else {
                    userState.set(varN, valueToSave);
                  }
                  break;
              }
              findNext();
              break;

            case "conditionNode":
              if (true) {
                matchRegex = /\+(.*?)\+/g;
                const varN = replaceVarIntoString(node.data.content, "Null");
                const type = node.data.type || "equals";

                const value = replaceVarIntoString(node.data.value, "Maycon");

                switch (type) {
                  case "equals":
                    if (userState.get(varN) == value) {
                      findNextById(node.true?.target);
                    } else {
                      findNextById(node.false?.target);
                    }
                    break;
                  case "contain":
                    if (userState.get(varN).includes(value)) {
                      findNextById(node.true?.target);
                    } else {
                      findNextById(node.false?.target);
                    }
                    break;
                  case "dontContain":
                    if (!userState.get(varN).includes(value)) {
                      findNextById(node.true?.target);
                    } else {
                      findNextById(node.false?.target);
                    }
                    break;
                  case "startsWith":
                    if (userState.get(varN).startsWith(value)) {
                      findNextById(node.true?.target);
                    } else {
                      findNextById(node.false?.target);
                    }
                    break;
                  case "endsWith":
                    if (userState.get(varN).endsWith(value)) {
                      findNextById(node.true?.target);
                    } else {
                      findNextById(node.false?.target);
                    }
                    break;
                  case "greatherThan":
                    if (userState.get(varN) > value) {
                      findNextById(node.true?.target);
                    } else {
                      findNextById(node.false?.target);
                    }
                    break;
                  case "lessThan":
                    if (userState.get(varN) < value) {
                      findNextById(node.true?.target);
                    } else {
                      findNextById(node.false?.target);
                    }
                    break;
                  case "greatherOrEqual":
                    if (userState.get(varN) >= value) {
                      findNextById(node.true?.target);
                    } else {
                      findNextById(node.false?.target);
                    }
                    break;
                  case "lessOrEqual":
                    if (userState.get(varN) <= value) {
                      findNextById(node.true?.target);
                    } else {
                      findNextById(node.false?.target);
                    }
                    break;
                  case "isSet":
                    if (userState.get(varN)) {
                      findNextById(node.true?.target);
                    } else {
                      findNextById(node.false?.target);
                    }
                    break;
                  case "isEmpty":
                    if (!userState.get(varN)) {
                      findNextById(node.true?.target);
                    } else {
                      findNextById(node.false?.target);
                    }
                    break;
                  case "regex":
                    if (userState.get(varN).match(new RegExp(value))) {
                      findNextById(node.true?.target);
                    } else {
                      findNextById(node.false?.target);
                    }
                    break;
                  case "notRegex":
                    if (!userState.get(varN).match(new RegExp(value))) {
                      findNextById(node.true?.target);
                    } else {
                      findNextById(node.false?.target);
                    }
                    break;
                }
              }
              break;

            case "webhookNode":
              const url = replaceVarIntoString(node.data.url, "Null");
              const body = JSON.parse(
                replaceVarIntoString(node.data.body, "{}")
              );
              const headers = JSON.parse(
                replaceVarIntoString(node.data.headers, "{}")
              );
              const method = node.data.method || "GET";
              const save = replaceVarIntoString(node.data.variable, "Null");

              if (url != "Null") {
                const data = await new Promise((r) => {
                  if (method === "GET") {
                    fetch(url, {
                      headers: headers,
                      method: method,
                    })
                      .then((res) => res.text())
                      .then((res) => r(res));
                  } else {
                    fetch(url, {
                      body: body,
                      headers: headers,
                      method: method,
                    })
                      .then((res) => res.text())
                      .then((res) => r(res));
                  }
                });

                userState.set(save, data);
              } else {
                userState.set(save, "No valid url was found.");
              }
              findNext();
              break;

            case "messageToNode":
              const number = replaceVarIntoString(
                node.data.number,
                "55(99)99999-9999"
              );
              addMessage("center", number, formatedCurrentTime());
              findNext();
              break;

            case "pixNode":
              addMessage(
                "left",
                "Gerando PIX copia e cola...(exemplo)",
                formatedCurrentTime()
              );
              addMessage(
                "left",
                "00020126360014BR.GOV.BCB.PIX0114+55999999999995204000053039865802BR5907No Name6007No city62070503***63044122",
                formatedCurrentTime()
              );
              findNextById(node.true?.target);
              break;

            case "cartNode":
              const nodeType = node.data.type || "add";
              const item = replaceVarIntoString(node.data.item, "Null");
              const itemValue = node.data.value || 0;
              var cart = { ...userState.get("CART_RAW_DATA") };

              if (nodeType == "add") {
                cart[item] = {
                  value: itemValue,
                  name: item,
                  quantity:
                    (cart[item]?.quantity || 0) + Number(node.data.quantity),
                };
              } else {
                if (
                  (cart[item]?.quantity || 0) - Number(node.data.quantity) >
                  0
                ) {
                  cart[item] = {
                    value: cart[item].value,
                    name: item,
                    quantity:
                      (cart[item]?.quantity || 0) - Number(node.data.quantity),
                  };
                } else {
                  delete cart[item];
                }
              }

              var cartValue = 0;
              Object.keys(cart).forEach((key) => {
                var item = cart[key];
                cartValue =
                  cartValue + Number(item.value) * Number(item.quantity);
              });

              var cartString = ``;
              Object.keys(cart).forEach((key) => {
                var item = cart[key];
                cartString = `${cartString}
                  ${item.name} : $${item.value} -> ${item.quantity} UN
                `;
              });

              cartString = `${cartString}
              *Total*: $${cartValue}
            `;

              userState.set("CART_RAW_DATA", cart);
              userState.set("CART_DATA", cartString);
              userState.set("CART_VALUE", cartValue);
              findNext();
              break;
          }
          break;
      }

      return {
        callNext: callNext,
        next: nextStage,
        reset: reset,
        message: workingMessage,
      };
    },
    [addMessage, flowSteps, replaceVarIntoString, stage, userState]
  );

  const processStagesUntilStop = useCallback(
    async (initialStage: number = 0, message: null | string = null) => {
      if (!flowSteps.current.steps) return;
      if (initialStage == 0) message = null;
      var currentMessage = message;

      var loop = true;
      var index = initialStage;
      var data;

      while (loop) {
        data = await processNode(
          flowSteps.current.steps[index],
          currentMessage,
          index
        );
        index = data.next;

        setStage(index);
        currentMessage = data.message;

        loop = data.callNext;
      }

      if (data?.reset) {
        setStage(0);
      }
    },
    [processNode]
  );

  useEffect(() => {
    if (showTestModal && stage == null) {
      setStage(0);
      const raw_data = getFlowData();
      const data = flowConversion.convertToCustomFormat(raw_data);
      flowSteps.current = data;
      processStagesUntilStop(0);
    }

    if (!showTestModal) {
      setStage(null);
    }
  }, [showTestModal, stage, flowSteps, getFlowData, processStagesUntilStop]);

  const handleTestSubmit = (e: any) => {
    e.preventDefault();
    addMessage("right", inputMessageRef.current!.value, formatedCurrentTime());
    processStagesUntilStop(stage || 0, inputMessageRef.current!.value);
    inputMessageRef.current!.value = "";
  };

  //import and export
  const importRef = useRef<HTMLInputElement>(null);

  const makeExport = useCallback(() => {
    const content = getFlowData();
    const jsonString = JSON.stringify(content, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "export_flow.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [getFlowData]);

  const makeImport = useCallback(() => {
    const fileInput = importRef.current;

    const restoreFlow = async (data: any) => {
      const savedDataString = data;
      if (savedDataString) {
        const data = JSON.parse(savedDataString);
        const flow = data.flow;

        if (flow) {
          const { nodes: savedNodes = [], edges: savedEdges = [] } = flow;

          const { x = 0, y = 0, zoom = 1 } = flow.viewport;

          setViewport({ x, y, zoom });
          setNodes(savedNodes);
          setNodes((nodes) =>
            nodes.map((n: any) => {
              n.data.setData = setData(n.id);
              n.data.deleteSelf = deleteNode(n.id);
              return n;
            })
          );

          setEdges(savedEdges);
        }
      }
    };


    if (fileInput && fileInput.files) {
      const file = fileInput.files[0];
      const reader = new FileReader();

      reader.onload = (event: any) => {
        const content = event.target.result;
        importRef.current!.value = "";
        restoreFlow(content);
      };

      reader.readAsText(file);
    }
  }, [deleteNode, setData, setEdges, setNodes, setViewport]);

  return (
    <div ref={flowRef} className="w-full h-full" id="flow-editor">
      {showTestModal ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none m-4">
            <div className="relative w-auto my-6 mx-auto max-w-3xl h-[90%]">
              <div className="min-w-[80vw] sm:min-w-[500px] overflow-hidden border rounded-lg shadow-lg relative flex flex-col bg-[#18181b] outline-none focus:outline-none border-[#3d3d40] h-full">
                <div className="flex items-start justify-between p-5 rounded-t">
                  <button
                    className="p-1 ml-auto bg-transparent border-0 text-white float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => {
                      setMessages([]);
                      setShowTestModal(false);
                    }}
                  >
                    <span className="bg-transparent text-white h-6 w-6 text-2xl block outline-none focus:outline-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        viewBox="0 0 1024 1024"
                        fill="currentColor"
                      >
                        <path d="M195.2 195.2a64 64 0 0 1 90.496 0L512 421.504 738.304 195.2a64 64 0 0 1 90.496 90.496L602.496 512 828.8 738.304a64 64 0 0 1-90.496 90.496L512 602.496 285.696 828.8a64 64 0 0 1-90.496-90.496L421.504 512 195.2 285.696a64 64 0 0 1 0-90.496z" />
                      </svg>
                    </span>
                  </button>
                </div>
                <div className="relative px-6 flex-auto overflow-auto no-scrollbar">
                  <div
                    className="w-full h-full flex flex-col "
                    ref={messagesContainer}
                  >
                    {messages?.map((message) => {
                      if (message.side == "left") {
                        return (
                          <div
                            key={randomBytes(20).toString("hex")}
                            className="flex"
                          >
                            <div className="mr-auto rounded-lg rounded-tl-none my-1 p-2 text-sm bg-white flex flex-col relative speech-bubble-left">
                              <div className="mx-2">
                                {customHighlight(message.message, true)}
                              </div>
                              <p className="text-gray-600 text-xs text-right leading-none">
                                {message.date}
                              </p>
                            </div>
                          </div>
                        );
                      } else if (message.side == "right") {
                        return (
                          <div
                            key={randomBytes(20).toString("hex")}
                            className="flex justify-end"
                          >
                            <div className="ml-auto rounded-lg rounded-tr-none my-1 p-2 text-sm bg-green-300 flex flex-col relative speech-bubble-right">
                              <div className="mx-2">
                                {customHighlight(message.message, true)}
                              </div>
                              <p className="text-gray-600 text-xs text-right leading-none">
                                {message.date}
                              </p>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div
                            key={randomBytes(20).toString("hex")}
                            className="w-full text-center"
                          >
                            <span className="text-gray-700">
                              Mensagem enviada para {message.message}
                            </span>
                          </div>
                        );
                      }
                    })}
                    <div ref={bottomRef} />
                  </div>
                </div>
                <div className="flex items-center justify-end px-6 pb-6 rounded-b">
                  <form className="w-full flex" onSubmit={handleTestSubmit}>
                    <input
                      required
                      className="shadow appearance-none border rounded-l-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="message"
                      type="text"
                      placeholder="Type something..."
                      ref={inputMessageRef}
                    />
                    <button
                      type="submit"
                      className="rounded-r-lg bg-green-500 w-[20%] flex justify-center text-white items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={25}
                        height={25}
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.5 12H5.42m-.173.797L4.242 15.8c-.55 1.643-.826 2.465-.628 2.971.171.44.54.773.994.9.523.146 1.314-.21 2.894-.92l10.135-4.561c1.543-.695 2.314-1.042 2.553-1.524a1.5 1.5 0 0 0 0-1.33c-.239-.482-1.01-.83-2.553-1.524L7.485 5.243c-1.576-.71-2.364-1.064-2.887-.918a1.5 1.5 0 0 0-.994.897c-.198.505.074 1.325.618 2.966l1.026 3.091c.094.282.14.423.159.567a1.5 1.5 0 0 1 0 .385c-.02.144-.066.285-.16.566Z"
                        />
                      </svg>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
      <ReactFlow
        className="bg-[#1f1f23] touchdevice-flow"
        nodes={nodes}
        nodeTypes={nodeTypes}
        edges={edges}
        defaultEdgeOptions={edgeStylingOptions}
        isValidConnection={isValidConnection}
        onNodesChange={onNodesChange}
        zoomOnDoubleClick={false}
        deleteKeyCode={
          selectedElements[0]?.type == "startNode" ? null : "Backspace"
        }
        onEdgesChange={(e) => {
          onEdgesChange(e);
          saveHistory();
        }}
        onEdgesDelete={() => saveHistory()}
        onConnect={(e) => {
          onConnect(e);
          saveHistory();
        }}
        onNodeDragStop={() => {
          saveHistory();
        }}
        onDragOver={onDragOver}
        onPaneClick={onPaneClick}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onNodeClick={onNodeClick}
      >
        <Panel
          position="top-left"
          className={`h-[95%] flex transition-all overflow-hidden ${
            isHidable && isHide && "-left-[18.5rem]"
          }`}
          style={{ margin: "15px !important" }}
        >
          <div
            className="w-full h-full bg-[#18181b] rounded-md p-4 border border-[#3d3d40] text-white overflow-auto no-scrollbar"
            style={{
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div className="w-full">
              <h1 className="text-white text-sm font-[600] mb-2">Básicos</h1>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="text-xs cursor-grab bg-[#1f1f23] hover:bg-[#2d2d33] border border-[#27272a] rounded-md transition-all px-4 py-2 flex items-center"
                  onDragStart={(event) => onDragStart(event, "messageNode")}
                  draggable
                  onMouseUp={() => addNode("messageNode")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={20}
                    height={20}
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
                  <span className="ml-2">Mensagem</span>
                </div>
                <div
                  className="text-xs cursor-grab bg-[#1f1f23] hover:bg-[#2d2d33] border border-[#27272a] rounded-md transition-all px-4 py-2 flex items-center"
                  onDragStart={(event) => onDragStart(event, "marker")}
                  draggable
                  onMouseUp={() => addNode("marker")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={20}
                    className="text-blue-500"
                    height={20}
                    viewBox="0 0 1920 1920"
                  >
                    <path
                      fill="currentColor"
                      fillRule="evenodd"
                      d="M866.332 213v653.332H213v186.666h653.332v653.332h186.666v-653.332h653.332V866.332h-653.332V213z"
                    />
                  </svg>
                  <span className="ml-2">Marcador</span>
                </div>
              </div>
            </div>
            <div className="w-full mt-8">
              <h1 className="text-white text-sm font-[600] mb-2">Entradas</h1>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="text-xs cursor-grab bg-[#1f1f23] hover:bg-[#2d2d33] border border-[#27272a] rounded-md transition-all px-4 py-2 flex items-center"
                  onDragStart={(event) => onDragStart(event, "textInputNode")}
                  draggable
                  onMouseUp={() => addNode("textInputNode")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={15}
                    height={15}
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
                  <span className="ml-2">Texto</span>
                </div>
                <div
                  className="text-xs cursor-grab bg-[#1f1f23] hover:bg-[#2d2d33] border border-[#27272a] rounded-md transition-all px-4 py-2 flex items-center"
                  onDragStart={(event) => onDragStart(event, "numberInputNode")}
                  draggable
                  onMouseUp={() => addNode("numberInputNode")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={15}
                    height={15}
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
                  <span className="ml-2">Número</span>
                </div>
                <div
                  className="text-xs cursor-grab bg-[#1f1f23] hover:bg-[#2d2d33] border border-[#27272a] rounded-md transition-all px-4 py-2 flex items-center"
                  onDragStart={(event) => onDragStart(event, "emailInputNode")}
                  draggable
                  onMouseUp={() => addNode("emailInputNode")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={20}
                    height={20}
                    className="text-[#f7a04b]"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.4 19.2A9 9 0 1 1 21 12v1.5a2.5 2.5 0 0 1-5 0V8m0 4a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                    />
                  </svg>
                  <span className="ml-2">Email</span>
                </div>
                <div
                  className="text-xs cursor-grab bg-[#1f1f23] hover:bg-[#2d2d33] border border-[#27272a] rounded-md transition-all px-4 py-2 flex items-center"
                  onDragStart={(event) => onDragStart(event, "regexInputNode")}
                  draggable
                  onMouseUp={() => addNode("regexInputNode")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    fill="none"
                    className="text-[#f7a04b]"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  >
                    <path d="M17 3v10M12.67 5.5l8.66 5M12.67 10.5l8.66-5M9 17a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2z" />
                  </svg>
                  <span className="ml-2">Regex</span>
                </div>
              </div>
            </div>
            <div className="w-full mt-8">
              <h1 className="text-white text-sm font-[600] mb-2">Lógica</h1>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="text-xs cursor-grab bg-[#1f1f23] hover:bg-[#2d2d33] border border-[#27272a] rounded-md transition-all px-4 py-2 flex items-center"
                  onDragStart={(event) =>
                    onDragStart(event, "setVariableLogicNode")
                  }
                  draggable
                  onMouseUp={() => addNode("setVariableLogicNode")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={20}
                    height={20}
                    fill="none"
                    viewBox="0 0 24 24"
                    className="text-blue-500"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="m15.5 5.5 2.828 2.828M3 21l.047-.332c.168-1.176.252-1.764.443-2.312.17-.487.401-.95.69-1.378.323-.482.743-.902 1.583-1.741L17.41 3.589a2 2 0 0 1 2.828 2.828L8.377 18.28c-.761.762-1.142 1.143-1.576 1.445-.385.27-.8.492-1.237.664-.492.194-1.02.3-2.076.513L3 21Z"
                    />
                  </svg>
                  <span className="ml-2">Set</span>
                </div>
                <div
                  className="text-xs cursor-grab bg-[#1f1f23] hover:bg-[#2d2d33] border border-[#27272a] rounded-md transition-all px-4 py-2 flex items-center"
                  onDragStart={(event) => onDragStart(event, "waitInputNode")}
                  draggable
                  onMouseUp={() => addNode("waitInputNode")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={20}
                    height={20}
                    fill="none"
                    viewBox="0 0 24 24"
                    className="text-blue-500"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 7v5l1.5-2.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                  <span className="ml-2">Espere</span>
                </div>
                <div
                  className="text-xs cursor-grab bg-[#1f1f23] hover:bg-[#2d2d33] border border-[#27272a] rounded-md transition-all px-4 py-2 flex items-center"
                  onDragStart={(event) => onDragStart(event, "jumpNode")}
                  draggable
                  onMouseUp={() => addNode("jumpNode")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={20}
                    height={20}
                    fill="none"
                    viewBox="0 0 24 24"
                    className="text-blue-500"
                  >
                    <path
                      fill="currentColor"
                      fillRule="evenodd"
                      d="M5.946 5.595C3.929 4.16 1 5.484 1 7.83v8.338c0 2.347 2.929 3.671 4.946 2.236L11 14.81v1.36c0 2.346 2.928 3.67 4.946 2.235l5.861-4.17c1.59-1.13 1.59-3.34 0-4.47l-5.861-4.17C13.928 4.16 11 5.484 11 7.83V9.19L5.946 5.595Zm-2.9 2.236c0-.783.976-1.224 1.649-.746l5.861 4.17a.897.897 0 0 1 0 1.49l-5.861 4.17c-.673.478-1.649.037-1.649-.746V7.831Zm10 0c0-.783.976-1.224 1.649-.746l5.861 4.17a.897.897 0 0 1 0 1.49l-5.861 4.17c-.673.478-1.649.037-1.649-.746V7.831Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-2">Pular</span>
                </div>
                <div
                  className="text-xs cursor-grab bg-[#1f1f23] hover:bg-[#2d2d33] border border-[#27272a] rounded-md transition-all px-4 py-2 flex items-center"
                  onDragStart={(event) => onDragStart(event, "conditionNode")}
                  draggable
                  onMouseUp={() => addNode("conditionNode")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={20}
                    height={20}
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
                  <span className="ml-2">Condição</span>
                </div>
              </div>
            </div>
            <div className="w-full mt-8">
              <h1 className="text-white text-sm font-[600] mb-2">Ação</h1>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="text-xs cursor-grab bg-[#1f1f23] hover:bg-[#2d2d33] border border-[#27272a] rounded-md transition-all px-4 py-2 flex items-center"
                  onDragStart={(event) => onDragStart(event, "webhookNode")}
                  draggable
                  onMouseUp={() => addNode("webhookNode")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-blue-500"
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
                      d="m13 3-7.931 9.693c-.342.418-.513.627-.514.803a.5.5 0 0 0 .186.394c.138.11.407.11.947.11H12l-1 7 7.93-9.693c.342-.418.513-.627.514-.803a.5.5 0 0 0-.186-.394C19.12 10 18.85 10 18.31 10H12l1-7Z"
                    />
                  </svg>
                  <span className="ml-2">Webhook</span>
                </div>
                <div
                  className="text-xs cursor-grab bg-[#1f1f23] hover:bg-[#2d2d33] border border-[#27272a] rounded-md transition-all px-4 py-2 flex items-center"
                  onDragStart={(event) => onDragStart(event, "messageToNode")}
                  draggable
                  onMouseUp={() => addNode("messageToNode")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={20}
                    height={20}
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
                  <span className=" ml-2">Para</span>
                </div>
                <div
                  className="text-xs cursor-grab bg-[#1f1f23] hover:bg-[#2d2d33] border border-[#27272a] rounded-md transition-all px-4 py-2 flex items-center"
                  onDragStart={(event) => onDragStart(event, "pixNode")}
                  draggable
                  onMouseUp={() => addNode("pixNode")}
                >
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
                  <span className=" ml-2">Pix</span>
                </div>
                <div
                  className="text-xs cursor-grab bg-[#1f1f23] hover:bg-[#2d2d33] border border-[#27272a] rounded-md transition-all px-4 py-2 flex items-center"
                  onDragStart={(event) => onDragStart(event, "cartNode")}
                  draggable
                  onMouseUp={() => addNode("cartNode")}
                >
                  <svg
                    className="text-blue-500"
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
                      d="m21 5-2 7H7.377M20 16H8L6 3H3m8 3 2 2 4-4M9 20a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm11 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
                    />
                  </svg>
                  <span className=" ml-2">Carrinho</span>
                </div>
              </div>
            </div>
          </div>
          {isHidable && (
            <div
              className="mx-2 h-full flex items-center justify-center cursor-pointer text-white"
              onClick={() => setIsHide(!isHide)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={30}
                height={30}
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m9 6 6 6-6 6"
                />
              </svg>
            </div>
          )}
        </Panel>
        <Panel position="top-right" className="pr-14 flex flex-col">
          <div
            className="flex flex-col fixed z-[1] rounded-md bg-[#2a2a2d] text-gray-400 min-w-[2rem]"
            style={{
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1),0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            }}
          >
            <button
              type="button"
              className="flex justify-center items-center h-8 w-full hover:bg-[#3a3a3e] rounded-t-md"
              aria-label="Undo"
              onClick={() => undo()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 8H5V3m.291 13.357a8 8 0 1 0 .188-8.991"
                />
              </svg>
            </button>
            <button
              type="button"
              className="flex justify-center items-center h-8 w-full hover:bg-[#3a3a3e] rounded-b-md"
              aria-label="Redo"
              onClick={() => redo()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 8h5V3m-.29 13.357a8 8 0 1 1-.19-8.991"
                />
              </svg>
            </button>
          </div>
          <div
            className="flex flex-col fixed z-[1] rounded-md bg-[#2a2a2d] text-gray-400 min-w-[2rem] mt-20"
            style={{
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1),0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            }}
          >
            <button
              type="button"
              className="flex justify-center items-center h-8 w-full hover:bg-[#3a3a3e] rounded-t-md"
              aria-label="Zoom in"
              onClick={() => zoomIn()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 12h6m0 0h6m-6 0v6m0-6V6"
                />
              </svg>
            </button>
            <button
              type="button"
              className="flex justify-center items-center h-8 w-full hover:bg-[#3a3a3e] rounded-b-md"
              aria-label="Zoom out"
              onClick={() => zoomOut()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 12h12"
                />
              </svg>
            </button>
          </div>
          <div
            className="flex flex-col fixed z-[1] rounded-md bg-[#2a2a2d] text-gray-400 min-w-[2rem] mt-40"
            style={{
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1),0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            }}
          >
            <button
              type="button"
              className="flex justify-center items-center h-8 w-full hover:bg-[#3a3a3e] rounded-t-md"
              aria-label="Save"
              onClick={() => onSave()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 21H7m10 0h.803c1.118 0 1.677 0 2.104-.218.377-.192.683-.498.875-.874.218-.427.218-.987.218-2.105V9.22c0-.45 0-.675-.048-.889a1.994 1.994 0 0 0-.209-.545c-.106-.19-.256-.355-.55-.682l-2.755-3.062c-.341-.378-.514-.57-.721-.708a1.999 1.999 0 0 0-.61-.271C15.863 3 15.6 3 15.075 3H6.2c-1.12 0-1.68 0-2.108.218a1.999 1.999 0 0 0-.874.874C3 4.52 3 5.08 3 6.2v11.6c0 1.12 0 1.68.218 2.107.192.377.497.683.874.875.427.218.987.218 2.105.218H7m10 0v-3.803c0-1.118 0-1.678-.218-2.105a2.001 2.001 0 0 0-.875-.874C15.48 14 14.92 14 13.8 14h-3.6c-1.12 0-1.68 0-2.108.218a1.999 1.999 0 0 0-.874.874C7 15.52 7 16.08 7 17.2V21m8-14H9"
                />
              </svg>
            </button>
            <button
              type="button"
              className="flex justify-center items-center h-8 w-full hover:bg-[#3a3a3e] rounded-b-md"
              aria-label="Restore"
              onClick={() => onRestore()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 16h5v5M10 8H5V3m14.418 6.003A8 8 0 0 0 5.086 7.976m-.504 7.021a8 8 0 0 0 14.331 1.027"
                />
              </svg>
            </button>
          </div>
          <div
            className="flex flex-col fixed z-[1] rounded-md bg-[#2a2a2d] text-gray-400 min-w-[2rem] mt-60"
            style={{
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1),0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            }}
          >
            <button
              type="button"
              className="flex justify-center items-center h-8 w-full hover:bg-[#3a3a3e] rounded-md"
              aria-label="Start testing"
              onClick={() => startTesting()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16.658 9.286c1.44.9 2.16 1.35 2.407 1.926a2 2 0 0 1 0 1.576c-.247.576-.967 1.026-2.407 1.926L9.896 18.94c-1.598.999-2.397 1.498-3.056 1.445a2 2 0 0 1-1.446-.801C5 19.053 5 18.111 5 16.226V7.774c0-1.885 0-2.827.394-3.358a2 2 0 0 1 1.446-.801c.66-.053 1.458.446 3.056 1.445l6.762 4.226Z"
                />
              </svg>
            </button>
          </div>
          <div
            className="flex flex-col fixed z-[1] rounded-md bg-[#2a2a2d] text-gray-400 min-w-[2rem] mt-20"
            style={{
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1),0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            }}
          >
            <button
              type="button"
              className="flex justify-center items-center h-8 w-full hover:bg-[#3a3a3e] rounded-t-md"
              aria-label="Zoom in"
              onClick={() => zoomIn()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 12h6m0 0h6m-6 0v6m0-6V6"
                />
              </svg>
            </button>
            <button
              type="button"
              className="flex justify-center items-center h-8 w-full hover:bg-[#3a3a3e] rounded-b-md"
              aria-label="Zoom out"
              onClick={() => zoomOut()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 12h12"
                />
              </svg>
            </button>
          </div>
          <div
            className="flex flex-col fixed z-[1] rounded-md bg-[#2a2a2d] text-gray-400 min-w-[2rem] mt-72"
            style={{
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1),0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            }}
          >
            <button
              type="button"
              className="flex justify-center items-center h-8 w-full hover:bg-[#3a3a3e] rounded-t-md"
              aria-label="Export"
              onClick={() => makeExport()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                viewBox="0 0 1920 1920"
              >
                <path
                  fill="currentColor"
                  d="m0 1016.081 409.186 409.073 79.85-79.736-272.867-272.979h1136.415V959.611H216.169l272.866-272.866-79.85-79.85L0 1016.082ZM1465.592 305.32l315.445 315.445h-315.445V305.32Zm402.184 242.372-329.224-329.11C1507.042 187.07 1463.334 169 1418.835 169h-743.83v677.647h112.94V281.941h564.706v451.765h451.765v903.53H787.946V1185.47H675.003v564.705h1242.353V667.522c0-44.498-18.07-88.207-49.581-119.83Z"
                />
              </svg>
            </button>
            <input
              type="file"
              accept=".json"
              ref={importRef}
              style={{display: 'none'}}
              onChange={makeImport}
            />
            <button
              type="button"
              className="flex justify-center items-center h-8 w-full hover:bg-[#3a3a3e] rounded-b-md"
              aria-label="Import"
              onClick={() => {
                importRef.current!.click()
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                viewBox="0 0 1920 1920"
              >
                <path
                  fill="currentColor"
                  d="m807.186 686.592 272.864 272.864H0v112.94h1080.05l-272.864 272.978 79.736 79.849 409.296-409.183-409.296-409.184-79.736 79.736ZM1870.419 434.69l-329.221-329.11C1509.688 74.07 1465.979 56 1421.48 56H451.773v730.612h112.94V168.941h790.584v451.762h451.762v1129.405H564.714v-508.233h-112.94v621.173H1920V554.52c0-45.176-17.619-87.754-49.58-119.83Zm-402.181-242.37 315.443 315.442h-315.443V192.319Z"
                />
              </svg>
            </button>
          </div>
        </Panel>
        <Background
          color="#2f2f39"
          variant={BackgroundVariant.Dots}
          size={2}
          gap={40}
        />
      </ReactFlow>
    </div>
  );
}

export default function Flow() {
  return (
    <ClickProvider>
      <ReactFlowProvider>
        <Graph />
      </ReactFlowProvider>
    </ClickProvider>
  );
}
