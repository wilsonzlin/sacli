import commandLineUsage from 'command-line-usage';
import {Command} from './Command';

const helpHeader = (cmd: Command, cliNamePrefix: string): commandLineUsage.Section => ({
  header: `${cliNamePrefix}${cmd.name}`,
  content: cmd.description,
});

const helpUsage = (cmd: Command, hasSubcommands: boolean, cliNamePrefix: string): commandLineUsage.Section => {
  const usage = [`{bold ${cliNamePrefix}${cmd.name} [command options...]}`];
  if (hasSubcommands) {
    usage.push(`{bold ${cliNamePrefix}${cmd.name} <subcommand> [subcommand options...]}`);
  }

  return {header: 'Usage', content: usage};
};

const helpSubcommands = (cmd: Command, subcommands: Command[], cliNamePrefix: string): commandLineUsage.Section[] => {
  if (!subcommands.length) {
    return [];
  }

  const currentCommandName = cmd.name;

  const subcommandsSectionContent = [];
  const subcommandsHelp = `For help using a specific subcommand, use {bold ${cliNamePrefix}${cmd.name} <subcommand> --help}`;

  for (const sub of subcommands) {
    subcommandsSectionContent.push({
      command: `{bold ${sub.name.slice(currentCommandName.length).trim()}}`,
      description: sub.description,
    });
  }

  return [
    {header: 'Subcommands', content: subcommandsSectionContent},
    {content: subcommandsHelp},
  ];
};

const helpOptions = (cmd: Command): commandLineUsage.Section => ({
  header: 'Options',
  optionList: [{
    alias: 'h',
    name: 'help',
    type: Boolean,
    description: 'Print this help guide',
  }, ...cmd.options],
});

export const generateCommandHelp = (cmd: Command, subcommands: Command[], cliName?: string | undefined): string => {
  const cliNamePrefix = cliName && cmd.name.length ? `${cliName} ` : (cliName || '');

  const help = [
    helpHeader(cmd, cliNamePrefix),
    helpUsage(cmd, !!subcommands.length, cliNamePrefix),
    ...helpSubcommands(cmd, subcommands, cliNamePrefix),
    helpOptions(cmd),
  ];

  return commandLineUsage(help);
};
