import { END, START, StateGraph, Annotation } from "@langchain/langgraph";
import model from "../../../model";
import { BaseMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";

async function getGraphBuilder() {
  const StateAnnotation = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
      reducer: (x, y) => x.concat(y),
    }),
  });

  const chatNode = async (
    state: typeof StateAnnotation.State,
    config?: RunnableConfig
  ) => {
    const { messages } = state;
    const response = await model.invoke(messages, config);
    return { messages: [response] };
  };

  return new StateGraph(StateAnnotation)
    .addNode("chat", chatNode)
    .addEdge(START, "chat")
    .addEdge("chat", END);
}

export default getGraphBuilder;
