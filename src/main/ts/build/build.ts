import * as commandLineUsage from "command-line-usage";
import CLI from "../cli/CLI";
import Command from "../cmd/Command";

    // Add `--help` option
    command.options = [...command.options, {
      alias: "h",
      name: "help",
      description: "Print this usage guide",
      type: Boolean,
    }];

interface InternalCommandState {
  [subcommand: string]: InternalCommandState;
  [s_command]?: Command<any>;
}

export default function build (cli: CLI) {
  let root_command: InternalCommandState = Object.create(null);
  for (let com of cli.commands) {
    let path = com.name.split(' ');
    if (path.length < 1 || !path.every(c => /^[^\s\0]+$/y.test(c))) {
      throw new SyntaxError(`"${com.name}" is not a valid command name`);
    }
    let components = path.slice();
    let state = root_command;
    let c;
    while (c = components.shift()) {
      if (!state[c]) {
        state[c] = Object.create(null);
      }
      state = state[c];
    }
  nodes.forEach(node => {
    if (node.hasCommand()) {
      node.setHelp(
        build_command_help(
          node.getCommand()!,
          node.getSubcommands(),
          cli.name,
        )
      );
    }
  });
}
