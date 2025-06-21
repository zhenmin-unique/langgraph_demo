import { END, START, StateGraph, Annotation } from "@langchain/langgraph";

async function main() {
  const StateAnnotation = Annotation.Root({
    route: Annotation<string>({
      reducer: (x, y) => (x ? `${x} -> ${y}` : y),
    }),
    intent: Annotation<string>(),
  });

  const nodeFactory = (route: string) => {
    return (state: typeof StateAnnotation.State) => {
      console.log(
        `Executing node ${route}, current route state:`,
        JSON.stringify(state)
      );
      return { route };
    };
  };

  const routeFromA = (state: typeof StateAnnotation.State): string[] => {
    if (state.intent === "do_c") {
      return ["c"];
    } else if (state.intent === "do_d") {
      return ["d"];
    } else {
      return []; // 不跳转
    }
  };

  const builder = new StateGraph(StateAnnotation)
    .addNode("a", nodeFactory("A"))
    .addEdge(START, "a")
    .addNode("b", nodeFactory("B"))
    .addNode("c", nodeFactory("C"))
    .addNode("d", nodeFactory("D"))
    .addEdge("a", "b")
    .addConditionalEdges("a", routeFromA, ["c", "d"])
    .addEdge("b", "d")
    .addEdge("c", "d")
    .addEdge("d", END);

  const graph = builder.compile();

  console.log("=== 测试:intent = do_c ===");
  const result1 = await graph.invoke({ route: "root", intent: "do_c" });

  console.log("Final Route (do_c):", result1.route);

  console.log("\n=== 测试:intent = do_d ===");
  const result2 = await graph.invoke({ route: "root", intent: "do_d" });

  console.log("Final Route (do_d):", result2.route);
}

export default main;
