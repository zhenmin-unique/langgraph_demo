import { StateGraph, Annotation } from "@langchain/langgraph";

async function main() {
  // 定义统一的状态结构
  const SharedState = Annotation.Root({
    input: Annotation<string>, // 用户输入内容
    result: Annotation<string>, // 处理结果
    step: Annotation<number>, // 当前处理步骤
  });

  // 子图节点1：处理输入文本
  const processInput = async (state: typeof SharedState.State) => {
    console.log(`[Subgraph] 正在处理输入: ${state.input}`);
    return { result: `已处理: ${state.input}`, step: state.step + 1 };
  };

  // 子图节点2：完成任务
  const finalizeTask = async (state: typeof SharedState.State) => {
    console.log(`[Subgraph] 最终结果: ${state.result}`);
    return { result: `最终输出: ${state.result}`, step: state.step + 1 };
  };

  // 创建子图
  const subgraph = new StateGraph(SharedState)
    .addNode("processInput", processInput)
    .addNode("finalizeTask", finalizeTask)
    .addEdge("__start__", "processInput")
    .addEdge("processInput", "finalizeTask")
    .compile();

  // 父图节点1：初始化数据
  const initializeData = async (state: typeof SharedState.State) => {
    console.log("[Parent] 初始化输入...");
    return { input: "示例输入", step: 0 };
  };

  // 父图节点2：后续处理
  const postProcessing = async (state: typeof SharedState.State) => {
    console.log(`[Parent] 后续处理 - 最终结果为: ${state.result}`);
    return { result: `后处理完成: ${state.result}`, step: state.step + 1 };
  };

  // 创建父图
  const parentGraph = new StateGraph(SharedState)
    .addNode("initializeData", initializeData)
    .addNode("subgraph", subgraph) // 将子图作为节点加入
    .addNode("postProcessing", postProcessing)
    .addEdge("__start__", "initializeData")
    .addEdge("initializeData", "subgraph")
    .addEdge("subgraph", "postProcessing")
    .compile();

  const result = await parentGraph.invoke({ input: "", result: "", step: 0 });
  console.log("最终状态:", result);
}

export default main;
