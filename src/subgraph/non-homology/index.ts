import { Annotation, StateGraph } from "@langchain/langgraph";

async function main() {
  const ParentState = Annotation.Root({
    userInput: Annotation<string>, // 用户输入
    processedData: Annotation<string>, // 处理后的数据
    status: Annotation<string>, // 当前流程状态
  });

  const ChildState = Annotation.Root({
    input: Annotation<string>, // 输入内容
    output: Annotation<string>, // 输出结果
    stage: Annotation<number>, // 当前阶段
  });

  const childNode1 = async (state: typeof ChildState.State) => {
    console.log(`[Child] 正在处理输入: ${state.input}`);
    return { output: `已解析: ${state.input}`, stage: state.stage + 1 };
  };

  const childNode2 = async (state: typeof ChildState.State) => {
    console.log(`[Child] 最终输出: ${state.output}`);
    return { output: `最终输出: ${state.output}`, stage: state.stage + 1 };
  };

  const childGraph = new StateGraph(ChildState)
    .addNode("parseInput", childNode1)
    .addNode("generateOutput", childNode2)
    .addEdge("__start__", "parseInput")
    .addEdge("parseInput", "generateOutput")
    .compile();

  const initialize = async (state: typeof ParentState.State) => {
    console.log("[Parent] 初始化用户输入...");
    return { userInput: "测试数据", status: "初始化完成" };
  };

  // 将父图状态映射为子图状态
  const mapToChildState = (state: typeof ParentState.State) => ({
    input: state.userInput,
    output: "",
    stage: 0,
  });

  // 子图执行完成后，将结果映射回父图状态
  const processChildResult = async (
    state: typeof ParentState.State,
    config?: any
  ) => {
    const childState = await childGraph.invoke(mapToChildState(state), config);
    console.log("[Parent] 收到子图结果:", childState);

    return {
      processedData: childState.output,
      status: "子图处理完成",
    };
  };

  const finalize = async (state: typeof ParentState.State) => {
    console.log(`[Parent] 最终结果: ${state.processedData}`);
    return { status: "流程全部完成" };
  };

  // 构建父图
  const parentGraph = new StateGraph(ParentState)
    .addNode("initialize", initialize)
    .addNode("runChildGraph", processChildResult)
    .addNode("finalize", finalize)
    .addEdge("__start__", "initialize")
    .addEdge("initialize", "runChildGraph")
    .addEdge("runChildGraph", "finalize")
    .compile();

  const result = await parentGraph.invoke({
    userInput: "",
    processedData: "",
    status: "未开始",
  });
  console.log("最终状态:", result);
}

export default main;
