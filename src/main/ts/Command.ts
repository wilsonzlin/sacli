export interface Option {
  alias: string;
  name: string;
  type: (input: string) => any;
  typeLabel?: string;
  description: string;
  multiple?: boolean;
  defaultOption?: boolean;
}

export interface Command {
  name: string;
  description: string;
  options: Option[];
  action: (args: any) => any;
}
