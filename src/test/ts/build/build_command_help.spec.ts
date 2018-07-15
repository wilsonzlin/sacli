import {expect} from "chai";
import "mocha";
import build_command_help from "../../../main/ts/build/build_command_help";

interface CommitCommand {
  message: string;
}

function normalise_terminal_text (text: string): string {
  return text
  // Trim whitespace
    .trim()
    // Collapse whitespace
    .replace(/\s+/g, " ")
    // Remove ANSI CSI sequence escape codes (mostly terminal colors and formatting)
    .replace(/\x1b\[[\x30-\x3f]*[\x20-\x2f]*[\x40-\x7e]/g, "");
}

describe("build_command_help", () => {
  it("should generate correct help", () => {
    let help = build_command_help({
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
      action: (args: CommitCommand) => {
        console.log(args);
      },
    }, [
      {
        name: "git commit amend",
        description: "Not a real command",
        options: [],
        action: () => void 0,
      },
    ]);

    expect(normalise_terminal_text(help)).to.equal(normalise_terminal_text(`
      git commit
      
        Record changes to the repository
       
      Usage
      
        git commit [command options...]
        git commit <subcommand> [subcommand options...]
          
      Subcommands
      
        amend    Not a real command
        
        For help using a specific subcommand, use git commit <subcommand> --help
       
      Options
      
        -h, --help Print this help guide
        -m, --message <msg> Use the given <msg> as the commit message.
    `));
  });
});
