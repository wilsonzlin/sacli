import {Command} from './Command';
import {CommandTreeNode} from './CommandTreeNode';
import {generateCommandHelp} from './help';

export interface CLI {
  name?: string;
  commands: Command[];
}

export const build = (cli: CLI): CommandTreeNode => {
  // Build a tree of commands
  const rootCommand = new CommandTreeNode();
  const nodes = [rootCommand];

  for (const command of cli.commands) {
    // Add `--help` option
    command.options = [...command.options, {
      alias: 'h',
      name: 'help',
      description: 'Print this usage guide',
      type: Boolean,
    }];

    const commandName = command.name;

    const components = commandName == '' ? [] : commandName.split(' ');
    if (components.length > 0 && !components.every(c => /^[^\s\0]+$/u.test(c))) {
      throw new SyntaxError(`"${commandName}" is not a valid command name`);
    }

    let node = rootCommand;
    for (const component of components) {
      if (!node.hasChild(component)) {
        const child = new CommandTreeNode();
        nodes.push(child);
        node.addChild(component, child);
      }
      node = node.getChild(component)!;
    }

    try {
      node.setCommand(command);
    } catch (e) {
      if (e instanceof TypeError) {
        throw new ReferenceError(`Duplicate command "${commandName}"`);
      }
      throw e;
    }
  }

  for (const node of nodes) {
    if (node.hasCommand()) {
      node.setHelp(generateCommandHelp(node.getCommand()!, node.getSubcommands(), cli.name));
    }
  }

  return rootCommand;
};
