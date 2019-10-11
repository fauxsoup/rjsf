/**
 * @namespace rjsf.SchemaForm
 */
import debug from 'debug';
import ObjectPath from 'objectpath';
import {createElement as h, useEffect, useMemo, useRef, useState} from 'react';

import {ARRAY_PLACEHOLDER} from './constants';
import Context from './context';
import {merge} from './forms';
import {getMapper, test} from './mapper';
import {SchemaField} from './schema-field';
import * as util from './util';

const log = debug('rjsf:index');

/**
 * Renders a form from the provided schema, using the provided model as a value
 * and the provided forms as a guide.
 * @property {*} model - The model to use as value for the form
 * @property {object} schema - The schema to use as a definition for the form
 * @property {object[]} forms - The rendering specification for the form
 * @property {object} localizer - Localization functions to be used
 */
export function SchemaForm(
    {model: incomingModel, schema, form, localizer = util.defaultLocalizer(), ...props}) {
    const [model, setModel] = useState(incomingModel);
    const merged            = useMemo(() => merge(schema, form), [schema, form])
    const validate          = util.useValidator(schema);
    const errors            = useMemo(() => computeErrors(model), [model]);
    const mapper            = useMemo(() => getMapper(props.mapper), [props.master]);
    const generateKey       = util.useKeyGenerator();

    const getValue = util.valueGetter(model, schema);
    const setValue = util.valueSetter(model, schema, setModel)
    const getError = util.errorGetter(errors);

    useEffect(function() {
        log('SchemaForm(%s) : useEffect() -> setModel(%o)', schema.title, props.model);
        setModel(incomingModel);
    }, [incomingModel])

    return h(Context.Provider,
             {
                 value: {
                     model,
                     schema,
                     form: merged,
                     mapper,
                     getValue,
                     setValue,
                     getError,
                     onChange,
                     localizer,
                     errors,
                 }
             },
             merged.map(form => {
                 const {schema} = form;
                 return h(SchemaField, {key: generateKey(form), schema, form, onChange})
             }));

    function onChange(event, value) {
        /**
         * This value could be coming from any of our root forms; we're mostly
         * just intercepting the event so we can trigger our parent!
         */
        if (props.onChange) {
            props.onChange(event, value);
        }
    }

    function computeErrors() {
        const {valid, errors} = validate(model);
        let errorMap          = {};

        if (!valid) {
            for (let error of errors) {
                const keys = ObjectPath.parse(error.dataPath.replace(/^\./, ''));
                errorMap[ObjectPath.stringify(keys)] = error.message;
            }
        }

        return errorMap;

        function setErrorMap(newErrorMap) {
            errorMap = newErrorMap;
        }
    }
}
