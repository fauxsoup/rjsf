import TextField from '@material-ui/core/TextField';
import debug from 'debug';
import {createElement as h} from 'react';

import {useDecorator, useLocalizer} from '../context';

const log = debug('rjsf:mapper:text');

export function Text(props) {
    const {schema, value, form, error} = props;
    const {otherProps}                 = props;
    const {title, description}         = form;
    const localize                     = useLocalizer();
    const deco                         = useDecorator();

    const localizer = useLocalizer();

    return h(deco.input.group, {form, error}, [
        title && h(deco.label, {key: 'label', form, error}, localizer.getLocalizedString(title)),
        h(deco.input.form, {key: 'form', form, onChange, value, error}),
        (error || description) &&
            h(deco.input.description,
              {key: 'description', form, error},
              localizer.getLocalizedString(error || description)),
    ]);

    function onChange(e) {
        props.onChange(e, e.target.value);
    }
}

export function TextArea(props) {
    const {form} = props;
    return h(Text, {
        ...props,
        otherProps: {
            multiline: true,
            rows: form.rows,
            rowMax: form.rowMax,
        }
    });
}
