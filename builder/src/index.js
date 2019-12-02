import './index.css';

const tty = (() => {
  const WIDTH = 80;

  process.stdout = {
    columns: WIDTH,
  };
  process.stderr = {
    columns: WIDTH,
  };

  const $output = document.querySelector('#tty-output');

  const write = msg => $output.textContent = msg;

  return {
    write,
    writeJson: obj => write(JSON.stringify(obj)),
  };
})();

const builder = (() => {
  const $builder = document.querySelector('#builder');
  const $name = document.querySelector('#name');
  const $commands = document.querySelector('#commands');
  const $templateCommand = document.querySelector('#template-command');
  const $templateOption = document.querySelector('#template-option');
  let onChange;

  const build = () => ({
    name: $name.value || undefined,
    commands: [...$commands.children].map($cmd => ({
      name: $cmd.querySelector('.command-name').value,
      description: $cmd.querySelector('.command-description').value,
      action: tty.writeJson,
      options: [...$cmd.querySelector('.command-options').children].map($opt => ({
        alias: $opt.querySelector('.option-alias').value,
        name: $opt.querySelector('.option-name').value,
        type: window[$opt.querySelector('.option-type').value],
        typeLabel: $opt.querySelector('.option-type-label').value || undefined,
        description: $opt.querySelector('.option-description').value,
        multiple: $opt.querySelector('.option-multiple').checked,
        defaultOption: $opt.querySelector('.option-default-option').checked,
      })),
    })),
  });

  $builder.addEventListener('click', e => {
    const $button = e.target;
    if ($button.tagName !== 'BUTTON') {
      return;
    }
    const $item = $button.parentNode.parentNode;
    switch ($button.name) {
    case 'add':
      $item.lastElementChild.appendChild(document.importNode(document.querySelector(`#${$button.value}`).content, true).firstElementChild);
      break;
    case 'move-up':
      $item.previousElementSibling && $item.previousElementSibling.before($item);
      break;
    case 'move-down':
      $item.nextElementSibling && $item.nextElementSibling.after($item);
      break;
    case 'delete':
      $item.remove();
      break;
    }
    onChange && onChange();
  });

  $builder.addEventListener('input', () => onChange && onChange());

  return {
    onChange: handler => onChange = handler,
    build,
    load: cli => {
      $name.value = cli.name;
      $commands.textContent = '';

      for (const cmd of cli.commands) {
        const $cmd = document.importNode($templateCommand.content, true).firstElementChild;
        $commands.appendChild($cmd);
        $cmd.querySelector('.command-name').value = cmd.name;
        $cmd.querySelector('.command-description').value = cmd.description;
        const $options = $cmd.querySelector('.command-options');

        for (const opt of cmd.options) {
          const $opt = document.importNode($templateOption.content, true).firstElementChild;
          $options.appendChild($opt);
          $opt.querySelector('.option-alias').value = opt.alias;
          $opt.querySelector('.option-name').value = opt.name;
          $opt.querySelector('.option-type').value = opt.type && opt.type.name;
          $opt.querySelector('.option-type-label').value = opt.typeLabel || '';
          $opt.querySelector('.option-description').value = opt.description;
          $opt.querySelector('.option-multiple').checked = opt.multiple;
          $opt.querySelector('.option-default-option').checked = opt.defaultOption;
        }
      }
    },
  };
})();

const $testCommand = document.querySelector('#test-command');

// Use dynamic import so process.std{out,err} can be mocked.
import('sacli')
  .then(sacli => {
    let cli;

    const test = () => {
      if (!cli) {
        return;
      }
      const cmd = $testCommand.value.trim();
      if (!cmd) {
        tty.write(cli.getHelp());
      } else {
        try {
          sacli.exec(cmd.split(/\s+/), cli);
        } catch (err) {
          tty.write(err.message);
        }
      }
    };

    $testCommand.addEventListener('input', test);

    builder.onChange(() => {
      const config = builder.build();
      try {
        cli = sacli.build(config);
      } catch (err) {
        tty.write(err.message);
        return;
      }
      test();
    });
  })
  .catch(console.error);
