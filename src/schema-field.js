import debug from 'debug';
import {createElement as h, useState} from 'react';

import {useMapper, useModel} from './context';
import {validator} from './util';

const log = debug('rjsf:schema-field');

export function SchemaField(props) {
    const {schema, form}  = props;

    const mapper              = useMapper();
    const model               = useModel();
    const Field               = mapper[form.type];
    if (!Field) {
        log('SchemaField(%o) : !Field : form : %o', form.key, form);
        return null;
    }

    let value = undefined;
    let error = undefined;
    if (form.key) {
        value = model.getValue(form.key);
        error = model.getError(form.key);
    }

    return h(Field, {schema, form, value, onChange, error});

    function onChange(e, value) {
        const newModel = model.setValue(form.key, value);
        if (model.onChange) {
            model.onChange(e, newModel);
        }
    }
}
