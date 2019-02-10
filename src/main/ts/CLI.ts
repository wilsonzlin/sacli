import {Command} from "./Command";

export interface CLI {
  name?: string;
  commands: Command[];
}
