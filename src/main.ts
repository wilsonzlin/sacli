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

export class Command<Parsed extends { [name: string]: any }> {
  private readonly optionsLookup: {
    [nameOrAlias: string]: InternalOption;
  } = Object.create(null);
  private readonly options: InternalOption[] = [];
  private defaultOpt: InternalOption | undefined;
  private readonly subcommands = new Map<string, Command<any>>();
  private _action: ((args: any) => void) | undefined;

  private constructor() {}

  public static new(): Command<{}> {
    return new Command();
  }

  subcommand(name: string): Command<Parsed> {
    const cmd = new Command();
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
    this.optionsLookup[opt.name] = opt;

    if (opt.alias !== undefined) {
      assertValidAlias(opt.alias);
      this.optionsLookup[opt.alias] = opt;
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
    Parsed &
      {
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
    Parsed &
      {
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
    Parsed &
      {
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
    Parsed &
      {
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
      let nameOrAlias: string;
      if (arg.startsWith("--")) {
        nameOrAlias = arg.slice(2);
      } else {
        nameOrAlias = arg.slice(1);
        if (nameOrAlias.length !== 1) {
          throw new SacliParseError(
            "Alias option is longer than one character"
          );
        }
      }
      if (!nameOrAlias) {
        continue;
      }
      const opt = this.optionsLookup[nameOrAlias];
      if (!opt) {
        throw new SacliParseError(`Unrecognised option "${nameOrAlias}"`);
      }
      const name = opt.name;
      const repeated = opt.mode === "repeated";
      let value: any = repeated ? [] : undefined;
      if (opt.boolean) {
        value = true;
      } else {
        while (args.length && !args[0].startsWith("--")) {
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
      if (this.subcommands.size) {
        const subcmdName = args.shift()!;
        const subcmd = this.subcommands.get(subcmdName);
        if (!subcmd) {
          throw new SacliParseError(`Unrecognised subcommand "${subcmdName}"`);
        }
        subcmd._eval(parsed, args);
      } else {
        throw new SacliParseError(`Unrecognised extra argument "${args[0]}"`);
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
