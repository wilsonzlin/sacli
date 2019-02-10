import {Option} from "./Option";

export interface Command {
  name: string;
  description: string;
  options: Option[];
  action: (args: any) => any;
}
