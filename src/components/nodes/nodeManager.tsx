import CartNode from "./cartNode";
import ConditionNode from "./conditionNode";
import EmailInputNode from "./emailInputNode";
import JumpNode from "./jumpNode";
import MessageNode from "./messageNode";
import MessageToNode from "./messageToNode";
import NumberInputNode from "./numberInputNode";
import PixNode from "./pixNode";
import RegexInputNode from "./regexInputNode";
import SetVariableLogicNode from "./setVariableLogicNode";
import TextInputNode from "./textInputNode";
import WaitInputNode from "./waitInputNode";
import WebhookNode from "./webhookNode";

const nodeComponents: any = {
  messageNode: MessageNode,
  textInputNode: TextInputNode,
  numberInputNode: NumberInputNode,
  emailInputNode: EmailInputNode,
  regexInputNode: RegexInputNode,
  setVariableLogicNode: SetVariableLogicNode,
  waitInputNode: WaitInputNode,
  jumpNode: JumpNode,
  conditionNode: ConditionNode,
  webhookNode: WebhookNode,
  messageToNode: MessageToNode,
  pixNode: PixNode,
  cartNode: CartNode,
};

export default Object.freeze(nodeComponents);
