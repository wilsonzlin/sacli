import {Command} from "./Command";

export class CommandTreeNode {
  private command?: Command | undefined;
  private help?: string;
  private readonly subcommands: { [name: string]: CommandTreeNode };

  constructor () {
    this.subcommands = Object.create(null);
  }

  getChild (name: string): CommandTreeNode | null {
    return this.subcommands[name] || null;
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

  hasSubcommands (): boolean {
    return Object.keys(this.subcommands).length > 0;
  }

  getSubcommands (): Command[] {
    return Object.keys(this.subcommands)
      .map(scn => this.subcommands[scn].command!)
      .filter(c => c);
  }

  hasCommand (): boolean {
    return !!this.command;
  }

  getCommand (): Command | null {
    return this.command || null;
  }

  setCommand (command: Command): void {
    if (this.command) {
      throw new TypeError(`A command already exists`);
    }
    this.command = command;
  }

  getHelp (): string | null {
    // Don't use || shortcut as help could be empty string
    if (this.help == undefined) {
      return null;
    }
    return this.help;
  }

  setHelp (help: string): void {
    this.help = help;
  }
}
