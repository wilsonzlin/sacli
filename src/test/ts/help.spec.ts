import {expect} from 'chai';
import 'mocha';
import {generateCommandHelp} from '../../main/ts/help';

const normText = (text: string) => text
  .trim()
  // Collapse whitespace
  .replace(/\s+/g, ' ')
  // Remove ANSI CSI sequence escape codes (mostly terminal colors and formatting)
  .replace(/\x1b\[[\x30-\x3f]*[\x20-\x2f]*[\x40-\x7e]/g, '');

describe('help', () => {
  it('should generate correct help', () => {
    const help = generateCommandHelp({
      name: 'git commit',
      description: 'Record changes to the repository',
      options: [
        {
          alias: 'm',
          name: 'message',
          description: 'Use the given <msg> as the commit message.',
          type: String,
          typeLabel: '<msg>',
        },
      ],
      action: (args: any) => {
        console.log(args);
      },
    }, [
      {
        name: 'git commit amend',
        description: 'Not a real command',
        options: [],
        action: () => void 0,
      },
    ]);

    expect(normText(help)).to.equal(normText(`
      git commit
      
        Record changes to the repository
       
      Usage
      
        git commit [command options...]
        git commit <subcommand> [subcommand options...]
          
      Subcommands
      
        amend    Not a real command
        
        For help using a specific subcommand, use git commit <subcommand> --help
       
      Options
      
        -h, --help Print this help guide
        -m, --message <msg> Use the given <msg> as the commit message.
    `));
  });
});
