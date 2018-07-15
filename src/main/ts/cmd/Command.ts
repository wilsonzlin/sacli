import Option from "../opt/Option";

export default interface Command<M> {
  name: string;
  description: string;
  options: ReadonlyArray<Option<M, keyof M>>;
  action: (args: M) => any;
}
