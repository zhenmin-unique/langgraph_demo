import { END, START, StateGraph, Annotation } from "@langchain/langgraph";

async function main() {
  const StateAnnotation = Annotation.Root({
    route: Annotation<string>({
      reducer: (x, y) => (x ? `${x} -> ${y}` : y),
    }),
  });

  const nodeFactory = (route: string) => {
    return (state) => {
      console.log(`Executing node ${route}, current route state:`, state.route);
      return { route };
    };
  };

  const builder = new StateGraph(StateAnnotation)
    .addNode("a", nodeFactory("A"))
    .addEdge(START, "a")
    .addNode("b", nodeFactory("B"))
    .addNode("c", nodeFactory("C"))
    .addNode("d", nodeFactory("D"))
    .addEdge("a", "b")
    .addEdge("a", "c")
    .addEdge("b", "d")
    .addEdge("c", "d")
    .addEdge("d", END);

  const graph = builder.compile();
  const finalRoute = await graph.invoke({ route: "root" });
  console.log("Final route: ", finalRoute);
}

export default main;
