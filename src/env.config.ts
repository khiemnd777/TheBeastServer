import dotenv from "dotenv";
import dotenvParseVariables from "dotenv-parse-variables";

const env = dotenv.config();
if (env.error) throw env.error;
const envParsed = dotenvParseVariables(env.parsed);

export default function index<T>(name: string) {
  return envParsed[name] as T;
}
