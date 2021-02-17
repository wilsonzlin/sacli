import { Command } from "./main";

test("types work correctly", () => {
  const git = Command.new().optional("dir", String).optional("id", Number);
  git
    .subcommand("status")
    .boolean("verbose")
    .action((args) => {
      expect(args.dir).toBeUndefined();
      expect(args.id).toStrictEqual(78);
      expect(args.verbose).toStrictEqual(false);
    });
  git.eval(["--id", "78", "status"]);
});
