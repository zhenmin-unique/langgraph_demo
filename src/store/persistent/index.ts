import { createInterface } from "readline";
import getGraphBuilder from "../utils/graph.";
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
import { HumanMessage } from "@langchain/core/messages";

async function main() {
  const memory = await SqliteSaver.fromConnString(
    "src/store/persistent/demo.db"
  );

  const builder = await getGraphBuilder();
  const graph = builder.compile({ checkpointer: memory });

  const thread_id = `thread-demo`;

  console.log(
    "🤖 欢迎来到 LangGraph CLI Chat。输入你的问题 (输入 'exit' 退出)：\n"
  );

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  while (true) {
    const input = await new Promise<string>((resolve) => {
      rl.question("你：", resolve);
    });

    if (input.toLowerCase() === "exit") {
      rl.close();
      break;
    }

    const state = await graph.invoke(
      { messages: [new HumanMessage(input)] },
      { configurable: { thread_id } }
    );

    const lastAIMessage = state.messages.slice(-1)[0];

    if (lastAIMessage && "content" in lastAIMessage) {
      console.log("AI：", lastAIMessage.content);
    }
  }

  console.log("\n📜 会话结束，再见！");
}

export default main;
