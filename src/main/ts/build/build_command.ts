import Command from "../cmd/Command";
import commandLineUsage = require("command-line-usage");

function build_command_help_header (cmd: Command<any>): commandLineUsage.Section {
  return {
    header: cmd.name,
    content: cmd.description,
  };
}

function build_command_help_usage (cmd: Command<any>, has_subcommands: boolean): commandLineUsage.Section {
  let usage = [`{bold ${cmd.name} [command options...]}`];
  if (has_subcommands) {
    usage.push(`{bold ${cmd.name} <subcommand> [subcommand options...]}`);
  }

  return {
    header: "Usage",
    content: usage,
  };
}

function build_command_help_subcommands (cmd: Command<any>, subcommands: ReadonlyArray<Command<any>>): ReadonlyArray<commandLineUsage.Section> {
  if (!subcommands.length) {
    return [];
  }

  let subcommands_section_content = [];
  let subcommands_help = `For help using a specific subcommand, use {bold ${cmd.name} <subcommand> --help`;

  for (let sub of subcommands) {
    subcommands_section_content.push({
      command: `{bold ${sub.name}}`,
      description: sub.description,
    });
  }

  return [
    {
      header: "Subcommands",
      content: subcommands_section_content,
    },
    {
      content: subcommands_help,
    },
  ];
}

function build_command_help_options (cmd: Command<any>): commandLineUsage.Section {
  return {
    header: "Options",
    optionList: [{
      alias: "h",
      name: "help",
      type: Boolean,
      description: "Print this help guide",
    }, ...cmd.options],
  };
}

export default function build_command (cmd: Command<any>, subcommands: ReadonlyArray<Command<any>>): string {
  let help = [];

  help.push(build_command_help_header(cmd));
  help.push(build_command_help_usage(cmd, !!subcommands.length));
  help = help.concat(build_command_help_subcommands(cmd, subcommands));
  help.push(build_command_help_options(cmd));

  return commandLineUsage(help);
}
