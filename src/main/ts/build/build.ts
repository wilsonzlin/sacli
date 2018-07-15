import * as commandLineUsage from "command-line-usage";
import CLI from "../cli/CLI";
import Command from "../cmd/Command";

const s_command = Symbol("command");

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
    state[s_command] = com;
  }
}
