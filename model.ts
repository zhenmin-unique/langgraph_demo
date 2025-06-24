import { ChatOpenAI } from "@langchain/openai";
import "dotenv/config";

export default new ChatOpenAI({
  model: "deepseek-chat",
  temperature: 0,
  configuration: {
    baseURL: process.env.BASE_URL,
    apiKey: process.env.API_KEY,
  },
});
