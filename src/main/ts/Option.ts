export interface Option {
  alias: string;
  name: string;
  type: (input: string) => any;
  typeLabel?: string;
  description: string;
  multiple?: boolean;
  defaultOption?: boolean;
}
