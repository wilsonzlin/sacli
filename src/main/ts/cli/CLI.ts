import Command from "../cmd/Command";

export default interface CLI {
  commands: ReadonlyArray<Command<any>>;
}
