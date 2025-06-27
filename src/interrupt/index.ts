import {
  END,
  START,
  StateGraph,
  Annotation,
  MemorySaver,
} from "@langchain/langgraph";
import model from "../../model";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import { createInterface, Interface } from "readline";

async function getGraphBuilder(rl: Interface) {
  const StateAnnotation = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
      reducer: (x, y) => x.concat(y),
    }),
    interrupted: Annotation<boolean>,
    pending_input: Annotation<string>,
  });

  const interruptNode = async (state: typeof StateAnnotation.State) => {
    const userInput = await new Promise<string>((resolve) => {
      rl.question("\n🛑答案是否满意？(yes/no): ", resolve);
    });

    return {
      pending_input: userInput.toLowerCase(),
      interrupted: userInput.toLowerCase() !== "yes",
    };
  };

  const chatNode = async (
    state: typeof StateAnnotation.State,
    config?: RunnableConfig
  ) => {
    const { messages } = state;

    const response = await model.invoke(messages, config);
    return { messages: [...messages, response] };
  };

  const printNode = (state: typeof StateAnnotation.State) => {
    const lastMessage = state.messages.slice(-1)[0];
    if ("content" in lastMessage && !(lastMessage instanceof HumanMessage)) {
      console.log(`AI：${lastMessage.content}`);
    }
    return {};
  };

  const feedbackNode = async (state: typeof StateAnnotation.State) => {
    const reason = await new Promise<string>((resolve) => {
      rl.question("❌ 请说明你不满意的原因：", resolve);
    });
    console.log("重新生成中...");

    return {
      messages: [
        ...state.messages,
        new HumanMessage(`我不满意你的回答，因为：${reason}`),
      ],
    };
  };

  return new StateGraph(StateAnnotation)
    .addNode("chat", chatNode)
    .addNode("interrupt", interruptNode)
    .addNode("print", printNode)
    .addNode("feedback", feedbackNode)
    .addEdge(START, "chat")
    .addEdge("feedback", "chat")
    .addEdge("chat", "print")
    .addEdge("print", "interrupt")
    .addConditionalEdges("interrupt", (state) => {
      if (state.pending_input === "yes") {
        return END;
      } else if (state.pending_input === "no") {
        return "feedback";
      }
      return END;
    });
}

export default async function main() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const builder = await getGraphBuilder(rl);
  const memory = new MemorySaver();

  const graph = builder.compile({ checkpointer: memory });
  const thread_id = `thread-demo`;

  console.log(
    "🤖 欢迎来到 LangGraph CLI Chat。输入你的问题 (输入 'exit' 退出)：\n"
  );

  while (true) {
    const input = await new Promise<string>((resolve) => {
      rl.question("你：", resolve);
    });

    if (input.toLowerCase() === "exit") {
      break;
    }

    const userMessage = new HumanMessage(input);
    await graph.invoke(
      { messages: [userMessage] },
      { configurable: { thread_id } }
    );
  }

  rl.close();
  console.log("\n📜 会话结束，再见！");
}
