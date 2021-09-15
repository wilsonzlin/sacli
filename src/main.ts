import { EOL } from "os";

type OptionOpts = { alias?: string; description?: string; default?: boolean };

const assertValidName = (name: string) => {
  if (!/^[a-zA-Z0-9]{2,}$/.test(name)) {
    throw new SyntaxError(
      `"${name}" is not a valid option or command name:\n  - at least two characters\n  - only alphanumerical characters`
    );
  }
};

const assertValidAlias = (alias: string) => {
  if (!/^[a-zA-Z0-9]$/.test(alias)) {
    throw new SyntaxError(
      `"${alias}" is not a valid option alias:\n  - one alphanumerical character`
    );
  }
};

export class SacliParseError extends Error {}

type InternalOption = {
  name: string;
  alias?: string;
  description?: string;
  boolean?: boolean;
  type: (raw: string) => any;
  mode: "optional" | "required" | "repeated";
  default?: boolean;
};

// Export for tests.
export const wrapText = (text: string, maxLen: number) => {
  text = text.trim();
  if (isNaN(maxLen) || maxLen < 5) {
    return [text];
  }
  const lines = [];
  let i = 0;
  while (i < text.length) {
    let j = i + maxLen;
    if (j >= text.length) {
      lines.push(text.slice(i));
      break;
    }
    const charAfter = text[j];
    if (!/\s/.test(charAfter)) {
      j--;
      while (i < j && /\W/.test(charAfter) && text[j] == charAfter) {
        j--;
      }
      while (i < j && /\w/.test(text[j])) {
        j--;
      }
      if (i == j) {
        j = i + maxLen - 1;
      }
    }
    lines.push(text.slice(i, j + 1).trim());
    i = j + 1;
    while (i < text.length && /\s/.test(text[i])) {
      i++;
    }
  }
  return lines;
};

const indented = (lines: string[], indent: number) =>
  lines.map((l) => " ".repeat(indent) + l).join(EOL);

export class Command<Parsed extends { [name: string]: any }> {
  private readonly optionByName: {
    [name: string]: InternalOption;
  } = Object.create(null);
  private readonly optionByAlias: {
    [alias: string]: InternalOption;
  } = Object.create(null);
  // We can't just use optionsLookup as it duplicates an option if it has an alias.
  private readonly options: InternalOption[] = [];
  private defaultOpt: InternalOption | undefined;
  private readonly subcommands = new Map<string, Command<any>>();
  private _action: ((args: any) => void) | undefined;

  private constructor(
    private readonly parent: Command<any> | undefined,
    private readonly name: string,
    private readonly description: string | undefined
  ) {}

  public static new(name: string, description?: string): Command<{}> {
    return new Command(undefined, name, description);
  }

  private get path(): string[] {
    return [...(this.parent?.path ?? []), this.name];
  }

  private printHelp() {
    const width = process.stderr.columns;
    const f = (code: number, msg: string) =>
      width ? `\x1b[${code}m${msg}\x1b[0m` : "";
    console.error(f(1, this.path.join(" ")));
    console.error(indented(wrapText(this.description ?? "", width - 2), 2));
    console.error();
    if (this.subcommands.size) {
      console.error(f(4, "Subcommands"));
      for (const cmd of this.subcommands.values()) {
        console.error(`  ${f(1, cmd.name)}`);
        console.error(indented(wrapText(cmd.description ?? "", width - 4), 4));
        console.error();
      }
    }
    const options = this.options
      .slice()
      .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    if (options.length) {
      console.error(f(4, "Options"));
      for (const option of options) {
        console.error(
          [
            "  ",
            f(1, `--${option.name}`),
            option.alias && f(2, `--${option.alias}`),
          ].join("")
        );
        console.error(
          indented(wrapText(option.description ?? "", width - 4), 4)
        );
        console.error();
      }
    }
  }

  subcommand(name: string, description?: string): Command<Parsed> {
    const cmd = new Command(this, name, description);
    if (this.defaultOpt) {
      throw new TypeError(
        "Base command accepts default options, so cannot have any subcommands"
      );
    }
    if (this.subcommands.has(name)) {
      throw new ReferenceError(`Subcommand "${name}" already exists`);
    }
    this.subcommands.set(name, cmd);
    return cmd as any;
  }

  private addOption(opt: {
    name: string;
    alias?: string;
    description?: string;
    boolean?: boolean;
    type: (raw: string) => any;
    mode: "optional" | "required" | "repeated";
    default?: boolean;
  }) {
    this.options.push(opt);

    assertValidName(opt.name);
    this.optionByName[opt.name] = opt;

    if (opt.alias !== undefined) {
      assertValidAlias(opt.alias);
      this.optionByAlias[opt.alias] = opt;
    }

    if (opt.default) {
      if (this.defaultOpt) {
        throw new ReferenceError("This command already has a default option");
      }
      if (this.subcommands.size) {
        throw new SyntaxError(
          "This command accepts subcommands, so cannot have any default options"
        );
      }
      this.defaultOpt = opt;
    }
  }

  boolean<N extends string>(
    name: N,
    opts: Omit<OptionOpts, "default"> = {}
  ): Command<
    Parsed & {
      [name in N]: boolean;
    }
  > {
    this.addOption({
      ...opts,
      name,
      type: () => true,
      boolean: true,
      mode: "optional",
    });
    return this;
  }

  optional<N extends string, T>(
    name: N,
    type: (raw: string) => T,
    opts: OptionOpts = {}
  ): Command<
    Parsed & {
      [name in N]: T | undefined;
    }
  > {
    this.addOption({
      ...opts,
      name,
      type,
      mode: "optional",
    });
    return this;
  }

  required<N extends string, T>(
    name: N,
    type: (raw: string) => T,
    opts: OptionOpts = {}
  ): Command<
    Parsed & {
      [name in N]: T;
    }
  > {
    this.addOption({
      ...opts,
      name,
      type,
      mode: "required",
    });
    return this;
  }

  repeated<N extends string, T>(
    name: N,
    type: (raw: string) => T,
    opts: OptionOpts = {}
  ): Command<
    Parsed & {
      [name in N]: T[];
    }
  > {
    this.addOption({
      ...opts,
      name,
      type,
      mode: "repeated",
    });
    return this;
  }

  action(fn: (args: Parsed) => void): this {
    this._action = fn;
    return this;
  }

  private _eval(parsed: any, args: string[]): void {
    // Parse own options first.
    while (args[0]?.startsWith("-")) {
      const arg = args.shift()!;
      let opt: InternalOption;
      if (arg.startsWith("--")) {
        const name = arg.slice(2);
        if (!name) {
          break;
        }
        opt = this.optionByName[name];
        if (!opt) {
          if (name == "help") {
            this.printHelp();
            return;
          }
          throw new SacliParseError(`Unrecognised option "${name}"`);
        }
      } else {
        const alias = arg.slice(1);
        opt = this.optionByAlias[alias];
        if (!opt) {
          if (alias == "h") {
            this.printHelp();
            return;
          }
          throw new SacliParseError(`Unrecognised short option "${alias}"`);
        }
      }
      const name = opt.name;
      const repeated = opt.mode === "repeated";
      let value: any = repeated ? [] : undefined;
      if (opt.boolean) {
        value = true;
      } else {
        while (
          args.length &&
          !args[0].startsWith("--") &&
          !args[0].startsWith("-")
        ) {
          const v = args.shift()!;
          if (!repeated) {
            value = opt.type(v);
            break;
          }
          value.push(opt.type(v));
        }
        if ((repeated && !value.length) || repeated === undefined) {
          throw new SacliParseError(`No values received for option "${name}"`);
        }
      }
      parsed[name] = value;
    }
    if (args.length && this.defaultOpt) {
      const opt = this.defaultOpt;
      let value: any;
      if (opt.mode === "repeated") {
        value = args.splice(0).map((v) => opt.type(v));
      } else {
        value = opt.type(args.shift()!);
      }
      parsed[opt.name] = value;
    }

    // Validate own options.
    for (const opt of this.options) {
      const name = opt.name;
      const found = Object.prototype.hasOwnProperty.call(parsed, name);
      if (!found) {
        if (opt.boolean) {
          parsed[name] = false;
        } else if (opt.mode === "repeated") {
          parsed[name] = [];
        } else if (opt.mode === "required") {
          throw new SacliParseError(`Value for "${name}" option not provided`);
        }
      }
    }

    // Parse remaining arguments.
    if (args.length) {
      const extraArg = args.shift()!;
      if (this.subcommands.size) {
        const subcmd = this.subcommands.get(extraArg);
        if (!subcmd) {
          throw new SacliParseError(`Unrecognised subcommand "${extraArg}"`);
        }
        subcmd._eval(parsed, args);
      } else {
        throw new SacliParseError(`Unrecognised extra argument "${extraArg}"`);
      }
    } else {
      const action = this._action;
      if (!action) {
        throw new SacliParseError(`No action registered for CLI command`);
      }
      action(parsed);
    }
  }

  eval(args: string[]): void {
    const values = Object.create(null);
    this._eval(values, args.slice());
  }
}
