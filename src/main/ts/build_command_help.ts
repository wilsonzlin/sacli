import commandLineUsage = require("command-line-usage");
import {Command} from "./Command";

const build_command_help_header = (cmd: Command, cliNamePrefix: string): commandLineUsage.Section => {
  return {
    header: `${cliNamePrefix}${cmd.name}`,
    content: cmd.description,
  };
};

const build_command_help_usage = (cmd: Command, has_subcommands: boolean, cliNamePrefix: string): commandLineUsage.Section => {
  let usage = [`{bold ${cliNamePrefix}${cmd.name} [command options...]}`];
  if (has_subcommands) {
    usage.push(`{bold ${cliNamePrefix}${cmd.name} <subcommand> [subcommand options...]}`);
  }

  return {
    header: "Usage",
    content: usage,
  };
};

const build_command_help_subcommands = (cmd: Command, subcommands: Command[], cliNamePrefix: string): commandLineUsage.Section[] => {
  if (!subcommands.length) {
    return [];
  }

  let current_command_name = cmd.name;

  let subcommands_section_content = [];
  let subcommands_help = `For help using a specific subcommand, use {bold ${cliNamePrefix}${cmd.name} <subcommand> --help}`;

  for (let sub of subcommands) {
    subcommands_section_content.push({
      command: `{bold ${sub.name.slice(current_command_name.length).trim()}}`,
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
};

const build_command_help_options = (cmd: Command): commandLineUsage.Section => {
  return {
    header: "Options",
    optionList: [{
      alias: "h",
      name: "help",
      type: Boolean,
      description: "Print this help guide",
    }, ...cmd.options],
  };
};

export const build_command_help = (cmd: Command, subcommands: Command[], cliName?: string | undefined): string => {
  let cliNamePrefix;
  if (cliName && cmd.name.length) {
    cliNamePrefix = cliName + " ";
  } else if (cliName) {
    cliNamePrefix = cliName;
  } else {
    cliNamePrefix = "";
  }

  const help = [
    build_command_help_header(cmd, cliNamePrefix),
    build_command_help_usage(cmd, !!subcommands.length, cliNamePrefix),
    ...build_command_help_subcommands(cmd, subcommands, cliNamePrefix),
    build_command_help_options(cmd),
  ];

  return commandLineUsage(help);
};
