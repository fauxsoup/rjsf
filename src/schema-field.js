import debug from 'debug';
import {createElement as h} from 'react';
import {useMapper, useModel} from './context';

const log = debug('rjsf:schema-field');

export function SchemaField(props) {
    const {schema, form}  = props;

    const mapper = useMapper();
    const model  = useModel();
    const Field  = mapper[form.type];

    if (!Field) {
        log('SchemaField() : !Field : type : %o', form.type);
        return null;
    }

    const value = model.getValue(form.key);

    log('SchemaField(%o) : value : %o', form.key, value);

    return h(Field, {schema, form, value, onChange});

    function onChange(e, value) {
        log('onChange(%o, %o)', e, value);
        model.setValue(form.key, value);

        if (props.onChange) {
            props.onChange(e, value);
        }
    }
}
