import {Command} from './Command';

export class CommandTreeNode {
  private command?: Command | undefined;
  private help?: string;
  private readonly subcommands: { [name: string]: CommandTreeNode };

  constructor () {
    this.subcommands = Object.create(null);
  }

  getChild (name: string): CommandTreeNode | undefined {
    return this.subcommands[name];
  }

  hasChild (name: string): boolean {
    return !!this.subcommands[name];
  }

  addChild (name: string, node: CommandTreeNode): void {
    if (this.hasChild(name)) {
      throw new TypeError(`Subcommand "${name}" already exists`);
    }
    this.subcommands[name] = node;
  }

  getSubcommands (): Command[] {
    return Object.keys(this.subcommands)
      .map(scn => this.subcommands[scn].command!)
      .filter(c => c);
  }

  hasCommand (): boolean {
    return !!this.command;
  }

  getCommand (): Command | undefined {
    return this.command;
  }

  setCommand (command: Command): void {
    if (this.command) {
      throw new TypeError('A command already exists');
    }
    this.command = command;
  }

  getHelp (): string | undefined {
    return this.help;
  }

  setHelp (help: string): void {
    this.help = help;
  }
}
