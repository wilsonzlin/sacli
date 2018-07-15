# Option type safety

Tried to implement type safety.

```typescript
export default interface Option<M, N extends keyof M, A extends true | false> {
  alias: string;
  name: N;
  type: new <T extends (A extends true ? (keyof (M[N])) : (M[N]))>(...args: any[]) => T;
  typeLabel: string;
  description: string;
  multiple?: A;
  defaultOption?: boolean;
}

interface CommitCommand {
  message: string;
  files: string[];
}

let command = {
  name: "git commit",
  description: "Record changes to the repository",
  options: [
    {
      alias: "m",
      name: "message",
      description: "Use the given <msg> as the commit message.",
      type: String,
      typeLabel: "<msg>",
    },
    {
      files: "f",
      name: "files",
      description: "Files to commit",
      type: String,
      typeLabel: "<file ...>",
      multiple: true,
    }
  ],
  action: (args: CommitCommand) => {
    console.log(args);
  },
} as Command<CommitCommand>
```

## How it works

## Shortcomings

- `M[K]` where `K extends keyof M` is the set of all types, not a specific type, even when `K` can be inferred to a specific string.
- Changing either `type` in an `Option` or the type in the interface did not cause an error, rendering the whole declarations pointless.
- Super weird and verbose.
- It's still possible to declare an interface and use it as the type to the first argument of the `action` callback.
