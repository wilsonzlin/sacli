import Command from "../cmd/Command";

export default interface CLI {
  name?: string;
  commands: Command[];
}
