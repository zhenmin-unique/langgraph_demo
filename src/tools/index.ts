import { tool } from "@langchain/core/tools";
import dayjs from "dayjs";
import { z } from "zod";
import model from "../../model";

async function main() {
  const getWeather = tool(
    (input) => {
      const { location } = input;
      return `${location}今日天气是晴`;
    },
    {
      name: "get_weather",
      description: "获取今天的天气",
      schema: z.object({
        location: z.string().describe("查询的地点"),
      }),
    }
  );

  const getDate = tool(
    () => {
      return dayjs(Date.now()).format("YYYY-MM-DD");
    },
    {
      name: "get_date",
      description: "获取今天的实时日期",
      schema: z.object({}),
    }
  );

  const tools = [getWeather, getDate];

  //   const toolNode = new ToolNode(tools);

  //   const messageWithMultipleToolCalls = new AIMessage({
  //     content: "",
  //     tool_calls: [
  //       {
  //         name: "get_weather",
  //         args: {
  //           location: "杭州",
  //         },
  //         id: "tool_call_id",
  //         type: "tool_call",
  //       },
  //       {
  //         name: "get_date",
  //         args: {},
  //         id: "tool_call_id_2",
  //         type: "tool_call",
  //       },
  //     ],
  //   });

  console.log(await model.bindTools(tools).invoke("今天几号，杭州天气如何"));
}

export default main;
