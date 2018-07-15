import CLI from "../cli/CLI";
import CommandTreeNode from "../cmd/CommandTreeNode";
import build_command_help from "./build_command_help";

export default function build (cli: CLI): CommandTreeNode {
  // Build a tree of commands
  let root_command = new CommandTreeNode();
  let nodes = [root_command];

  for (let command of cli.commands) {
    // Add `--help` option
    command.options = [...command.options, {
      alias: "h",
      name: "help",
      description: "Print this usage guide",
      type: Boolean,
    }];

    let command_name = command.name;

    let components = command_name == "" ? [] : command_name.split(" ");
    if (components.length > 0 && !components.every(c => /^[^\s\0]+$/u.test(c))) {
      throw new SyntaxError(`"${command_name}" is not a valid command name`);
    }

    let node = root_command;
    let component;
    while (component = components.shift()) {
      if (!node.hasChild(component)) {
        let child = new CommandTreeNode();
        nodes.push(child);
        node.addChild(component, child);
      }

      node = node.getChild(component)!;
    }

    try {
      node.setCommand(command);
    } catch (e) {
      if (e instanceof TypeError) {
        throw new ReferenceError(`Duplicate command "${command_name}"`);
      }
      throw e;
    }
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

  return root_command;
}
