# sacli

Easy declarative CLI builder for Node.js applications. Built on top of [command-line-args](https://github.com/75lb/command-line-args) and [command-line-usage](https://github.com/75lb/command-line-usage).

## Features

## Examples

### Simple

```typescript
import {build, exec} from "sacli";

interface CalculateCommand {
  mode: string;
  values: number[];
}

const cli = build({
  name: "calc",
  commands: [
    {
      name: "",
      description: "",
      options: [
        {
          alias: "m",
          name: "mode",
          description: "One of +, -, *, or /.",
          type: String,
          typeLabel: "<+|-|*|/>",
        },
        {
          alias: "v",
          name: "values",
          description: "Operands",
          type: Number,
          typeLabel: "<operands...>",
          defaultOption: true,
          multiple: true,
        },
      ],
      action: (options: CalculateCommand) => {
        const reducer = {
          "+": (t, c) => t + c,
          "-": (t, c) => t - c,
          "*": (t, c) => t * c,
          "/": (t, c) => t / c,
        }[options.mode];
        console.log(options.values.reduce(reducer));
      },
    },
  ],
});

exec(process.argv.slice(2), cli);
```

### Advanced

```typescript
import {build, exec} from "sacli";

interface BranchCommand {
  delete: boolean;
  branch: string;
}

interface CommitCommand {
  all: boolean;
  message: string;
  files: string[];
}

const cli = build({
  name: "git",
  commands: [
    {
      name: "branch",
      description: "List, create, or delete branches",
      options: [
        {
          alias: "d",
          name: "delete",
          description: "Delete the branch.",
          type: Boolean,
        },
        {
          alias: "b",
          name: "branch",
          description: "Branch to operate on.",
          type: String,
          typeLabel: "<branch>",
          defaultOption: true,
        },
      ],
      action: (options: BranchCommand) => {
        console.log(`Branch ${options.branch}`);
      },
    },
    {
      name: "commit",
      description: "Record changes to the repository",
      options: [
        {
          alias: "a",
          name: "all",
          description: "Add all files.",
          type: Boolean,
        },
        {
          alias: "m",
          name: "message",
          description: "Use the given <msg> as the commit message.",
          type: String,
          typeLabel: "<msg>",
        },
        {
          alias: "f",
          name: "files",
          description: "Commit the contents of the files without recording the changes already staged.",
          type: String,
          multiple: true,
          defaultOption: true,
        }
      ],
      action: (options: CommitCommand) => {
        console.log(`git commit -${options.all ? "a" : ""}m ${options.message} ${options.files.join(" ")}`);
      },
    },
  ],
});

exec(process.argv.slice(2), cli);
```
