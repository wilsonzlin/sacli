import commandLineArgs = require('command-line-args');
import {CommandTreeNode} from './CommandTreeNode';

export const exec = (provided: string[], commandTree: CommandTreeNode): void => {
  const optionArgs = provided.slice();

  let commandNode = commandTree;
  while (optionArgs.length && commandNode.hasChild(optionArgs[0])) {
    commandNode = commandNode.getChild(optionArgs.shift()!)!;
  }

  if (!commandNode.hasCommand()) {
    throw new ReferenceError(`No suitable command found to execute "${provided.join(' ')}"`);
  }

  const command = commandNode.getCommand()!;

  const parsedOptions = commandLineArgs(command.options, {argv: optionArgs});

  if (parsedOptions.help) {
    console.log(commandNode.getHelp() || 'No help available');
  } else {
    command.action(parsedOptions);
  }
};
