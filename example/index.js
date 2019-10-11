import * as MUI from '@material-ui/core';
import clsx from 'classnames';
import debug from 'debug';
import _ from 'lodash';
import {Component, createElement as h, Fragment, useEffect, useRef, useState} from 'react';
import AceEditor from 'react-ace';
import {render} from 'react-dom';
import {SchemaForm, util} from 'rjsf';
import shortid from 'shortid';

function useEditable(defaultValue) {
    const prev              = useRef({defaultValue});
    const [value, setValue] = useState(defaultValue);
    const [json, setJSON]   = useState(JSON.stringify(value, undefined, 2));

    useEffect(function() {
        setJSON(JSON.stringify(value, undefined, 2));
    }, [value]);

    useEffect(function() {
        if (_.isEqual(defaultValue, prev.current.defaultValue)) {
            prev.current = {defaultValue};
            return;
        }

        setJSON(JSON.stringify(defaultValue, undefined, 2));
    }, [defaultValue]);

    useEffect(function() {
        try {
            setValue(JSON.parse(json));
        } catch (err) {
        }
    }, [json]);

    return {value, json, setValue, setJSON};
}

function Editor(props) {
    return h(AceEditor, {
        ...props,
        mode: 'json',
        theme: 'github',
        height: '300px',
        width: 'auto',
        editorProps: {$blockScrolling: true}
    });
}

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {hasError: false};
    }

    componentDidCatch(error, info) {
        this.setState({hasError: true, error, info});
    }

    render() {
        if (this.state.hasError) {
            return h(Fragment, {}, [
                h(MUI.Typography, {variant: 'h6'}, 'Something went wrong'),
                h(MUI.Typography, {variant: 'body1'}, this.state.error.stack),
                h(MUI.Typography, {variant: 'caption'}, JSON.stringify(this.state.info)),
            ]);
        }

        return this.props.children;
    }
}

const log = debug('rjsf:example');

function importAll(context) {
    const keys   = context.keys();
    const result = {};

    for (let key of keys) {
        result[key] = context(key);

        log('import(%o) : %o', key, result[key]);
        if (result[key].default)
            result[key] = result[key].default;

        if (!result[key].schema)
            delete result[key];
    }

    return result;
}

const samples = importAll(require.context('./data/', true, /\.js(on)?$/));

function SelectExample(props) {
    const enm    = Object.keys(samples);
    const titles = enm.map(k => samples[k].schema.title);

    const form              = [{key: [], title: 'Sample', titles}];
    const schema            = {type: 'string', enum: enm};
    const model             = props.selected;

    try {
        return h(SchemaForm, {schema, form, model, onChange});
    } catch (err) {
        return null;
    }

    function onChange(event, value) {
        props.onChange(event, value);
    }
}
const ids = new WeakMap();
function idFor(object) {
    if (object === null)
        return 'null';
    if (object === undefined)
        return 'undefined';
    if (typeof object !== 'object')
        return object;

    if (ids.has(object))
        return ids.get(object);
    const id = shortid();
    ids.set(object, id);
    return id;
}

function RenderExample(props) {
    const {schema, form, model, className} = props;

    return h(ErrorBoundary, {key: getKey()}, h(SchemaForm, {schema, form, model, onChange}));

    function onChange(event, value) {
        props.onChange(value);
    }

    function getKey() {
        return idFor(schema);
    }
}

function getSample(selected) {
    if (selected in samples)
        return samples[selected];

    return {schema: {type: 'null'}, form: ['*']};
}

const useStyles = MUI.makeStyles(function(theme) {
    return {
        root: {display: 'flex', flexDirection: 'row'},
        manager: {flex: '1 0 auto'},
        example: {flex: '9 1 auto'},
    };
});

function Page(props) {
    const classes                 = useStyles();
    const [selected, setSelected] = useState('');
    const [localizer, setLocalizer] = useState(undefined);
    const schema                  = useEditable({type: 'null'});
    const form                    = useEditable(['*']);
    const model                   = useEditable(util.defaultForSchema(schema));

    useEffect(function() {
        const sample = getSample(selected);
        schema.setValue(sample.schema);
        form.setValue(sample.form);
        setLocalizer(sample.localization);
    }, [selected]);

    log('Page() : schema : %O', schema);
    log('Page() : form : %O', form);
    log('Page() : model : %O', model);

    return h('div', {className: classes.root}, [
        h(MUI.Card,
            {className: classes.example},
            [
                h(MUI.CardContent,
                    {},
                    [
                        h(RenderExample, {
                            key: 'render',
                            schema: schema.value,
                            form: form.value,
                            model: model.value,
                            onChange: onModelChange,
                            localizer,
                        }),
                    ]),
                h(MUI.CardContent,
                    {},
                    [
                        h(MUI.Typography, {variant: 'h6'}, 'Model'),
                        h(Editor, {value: model.json, onChange: model.setJSON, key: 'edit'}),
                    ])
            ]),
        h(MUI.Card,
            {className: classes.manager},
            [
                h(MUI.CardContent, {}, h(SelectExample, {key: 'select', selected, onChange})),
                h(MUI.CardContent,
                    {},
                    [
                        h(MUI.Typography, {variant: 'h6'}, 'Schema'),
                        h(Editor, {key: 'edit-schema', value: schema.json, onChange: schema.setJSON}),
                    ]),
                h(MUI.CardContent,
                    {},
                    [
                        h(MUI.Typography, {variant: 'h6'}, 'Form'),
                        h(Editor, {key: 'edit-form', value: form.json, onChange: form.setJSON}),
                    ]),
            ]),
    ]);

    function onChange(event, example) {
        setSelected(example);
    }

    function onModelChange(value) {
        model.setValue(value);
    }
}

async function init() {
    render(h(Page), document.getElementById('app'));
}

document.addEventListener('DOMContentLoaded', init);
