import {expect} from "chai";
import "mocha";
import {build, parse} from "../../../main/ts/main";

interface CommitCommand {
  message: string;
}

describe("parse", () => {
  it("should parse arguments and run relevant action when matched", () => {
    const EXPECTED_MSG = "Hi";

    let msg = "";

    let args = `git commit -m ${EXPECTED_MSG}`.split(" ");

    let cli = build({
      commands: [
        {
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
          ],
          action: (options: CommitCommand) => {
            msg = options.message;
          },
        },
      ],
    });

    parse(args, cli);

    expect(msg).to.equal(EXPECTED_MSG);
  });
});
