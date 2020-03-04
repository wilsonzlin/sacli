import {expect} from 'chai';
import 'mocha';
import {build} from '../../main/ts/build';
import {exec} from '../../main/ts/exec';

interface CommitCommand {
  all: boolean;
  message: string;
}

describe('exec', () => {
  it('should parse arguments and run relevant action when matched', () => {
    const EXPECTED_MSG = 'Hi';

    let args = `git commit -am ${EXPECTED_MSG}`.split(' ');

    let cli = build({
      commands: [
        {
          name: 'git commit',
          description: 'Record changes to the repository',
          options: [
            {
              alias: 'a',
              name: 'all',
              description: 'Tell the command to automatically stage files that have been modified and deleted, but new files you have not told Git about are not affected.',
              type: Boolean,
            },
            {
              alias: 'm',
              name: 'message',
              description: 'Use the given <msg> as the commit message.',
              type: String,
              typeLabel: '<msg>',
            },
          ],
          action: (options: CommitCommand) => {
            expect(options.message).to.equal(EXPECTED_MSG);
            expect(options.all).to.equal(true);
          },
        },
      ],
    });

    exec(args, cli);
  });
});
