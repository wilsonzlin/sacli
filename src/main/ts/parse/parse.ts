import CommandTreeNode from "../cmd/CommandTreeNode";
import commandLineArgs = require("command-line-args");

export default function parse (provided: string[], command_tree: CommandTreeNode): void {
  let option_args = provided.slice();

  let command_node = command_tree;

  while (true) {
    if (option_args.length && command_node.hasChild(option_args[0])) {
      command_node = command_node.getChild(option_args.shift()!)!;
    } else {
      break;
    }
  }

  if (!command_node.hasCommand()) {
    throw new ReferenceError(`No suitable command found to execute "${provided.join(" ")}"`);
  }

  let command = command_node.getCommand()!;

  let parsed_options = commandLineArgs(command.options, {argv: option_args});

  if (parsed_options.help) {
    console.log(command_node.getHelp() || "No help available");
    return;
  }

  command.action(parsed_options);
}
