export default interface Option<M, N extends keyof M> {
  alias: string;
  name: N;
  type: new (...args: any[]) => M[N];
  typeLabel: string;
  description: string;
  multiple?: boolean;
  defaultOption?: boolean;
}
