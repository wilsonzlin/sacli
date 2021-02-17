# sacli

Elegant and modern CLI builder for Node.js applications.

## Features

- Multiple commands at any depth.
- Automatic nicely formatted command help.
- Type safe across commands.

Get it now:

```bash
npm i sacli
```

## Example

```ts
const git = Command.new()
  .optional("dir", String)
  .required("id", Number)
  .repeated("flags", String);

git
  .subcommand("status")
  .boolean("verbose", {description: "Show full details"})
  .repeated("folders", String, {alias: "F"})
  .repeated("files", String, {default: true})
  .action((args) => {
    args.dir === undefined;
    args.id === 78;
    args.flags.length === 0;
    args.verbose === false;
    arrayEquals(args.folders, ["a/", "b/"]);
    arrayEquals(args.files, ["a", "b", "c"]);
  });

git.eval(["--id", "78", "status", "-F", "a/", "b/", "--", "a", "b", "c"]);
```
