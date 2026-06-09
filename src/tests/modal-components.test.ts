/** biome-ignore-all lint/style/noNonNullAssertion: Test narrowing */
import { ComponentType, TextInputStyle } from 'discord-api-types/v10';
import { describe, expect, it } from 'vitest';
import { checkbox, checkboxGroup, input, label, radioGroup, select } from '../components';
import { render } from '../internal';

describe('modal components', () => {
  it('renders labels around raw label child components', () => {
    const resolved = render(
      label(
        'Choose your class',
        radioGroup('class')
          .addOption('Warrior', 'warrior', false, { description: 'Strong and brave' })
          .addOption('Rogue', 'rogue')
          .addOption('Wizard', 'wizard')
          .default('wizard')
          .required(false),
      ).description('Pick exactly one class.'),
    );

    expect(resolved).toMatchObject([
      {
        type: ComponentType.Label,
        label: 'Choose your class',
        description: 'Pick exactly one class.',
        component: {
          type: ComponentType.RadioGroup,
          custom_id: 'class',
          required: false,
          options: [
            { label: 'Warrior', value: 'warrior', description: 'Strong and brave', default: false },
            { label: 'Rogue', value: 'rogue', default: false },
            { label: 'Wizard', value: 'wizard', default: true },
          ],
        },
      },
    ]);
  });

  it('renders checkbox groups with selection bounds and defaults', () => {
    const resolved = render(
      label(
        'Which days are you free?',
        checkboxGroup('days')
          .addOption('Monday', 'mon')
          .addOption('Tuesday', 'tue', true)
          .addOption('Wednesday', 'wed')
          .default('mon', 'wed')
          .min(0)
          .max(2)
          .required(false),
      ),
    );

    expect(resolved).toMatchObject([
      {
        type: ComponentType.Label,
        component: {
          type: ComponentType.CheckboxGroup,
          custom_id: 'days',
          min_values: 0,
          max_values: 2,
          required: false,
          options: [
            { label: 'Monday', value: 'mon', default: true },
            { label: 'Tuesday', value: 'tue', default: false },
            { label: 'Wednesday', value: 'wed', default: true },
          ],
        },
      },
    ]);
  });

  it('renders standalone checkboxes and does not row-wrap selects inside labels', () => {
    const [checkboxLabel, selectLabel] = render(
      label('Do you agree?', checkbox('agree').default()),
      label('Pick a size', select('size').addOption('Medium', 'm', true)),
    );

    expect(checkboxLabel).toMatchObject({
      type: ComponentType.Label,
      component: {
        type: ComponentType.Checkbox,
        custom_id: 'agree',
        default: true,
      },
    });
    expect(selectLabel).toMatchObject({
      type: ComponentType.Label,
      component: {
        type: ComponentType.StringSelect,
        custom_id: 'size',
      },
    });
    expect((selectLabel as unknown as { component: { components?: unknown[] } }).component.components).toBeUndefined();
  });

  it('renders text inputs as label children', () => {
    const resolved = render(
      label(
        'Tell us more',
        input('bio')
          .style('paragraph')
          .placeholder('Write a short bio')
          .value('Existing text')
          .min(10)
          .max(400)
          .required(false),
      ).description('This is shown above the input.'),
    );

    expect(resolved).toMatchObject([
      {
        type: ComponentType.Label,
        label: 'Tell us more',
        description: 'This is shown above the input.',
        component: {
          type: ComponentType.TextInput,
          custom_id: 'bio',
          style: TextInputStyle.Paragraph,
          placeholder: 'Write a short bio',
          value: 'Existing text',
          min_length: 10,
          max_length: 400,
          required: false,
        },
      },
    ]);
  });
});
