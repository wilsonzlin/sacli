import Option from "../opt/Option";

export default interface Command {
  name: string;
  description: string;
  options: Option[];
  action: (args: any) => any;
}
