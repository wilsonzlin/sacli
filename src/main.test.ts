import { Command } from "./main";

test("types work correctly", () => {
  const git = Command.new("git")
    .optional("dir", String)
    .required("id", Number)
    .repeated("flags", String);

  git
    .subcommand("status")
    .boolean("verbose", { description: "Show full details" })
    .repeated("folders", String, { alias: "F" })
    .repeated("files", String, { default: true })
    .action((args) => {
      expect(args.dir).toBeUndefined();
      expect(args.id).toStrictEqual(78);
      expect(args.flags).toStrictEqual([]);
      expect(args.verbose).toStrictEqual(false);
      expect(args.folders).toStrictEqual(["a/", "b/"]);
      expect(args.files).toStrictEqual(["a", "b", "c"]);
    });

  git.eval(["--id", "78", "status", "-F", "a/", "b/", "--", "a", "b", "c"]);
});
