import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import Input from '@material-ui/core/Input';
import {makeStyles} from '@material-ui/core/styles';
import {createElement as h, Fragment, useRef} from 'react';

/**
 * @component
 */
const useStyles = makeStyles(function(theme) {
    return {fileInput: {display: 'none'}};
});
export default function Form(props) {
    const {form, value} = props;
    const ref           = useRef();
    const classes       = useStyles();

    const endAdornment = h(Fragment, {}, [
        h(Button, {onClick}, h(Icon, {}, 'attach_file')),
        h(Button, {onClick: clear}, h(Icon, {}, 'clear')),
    ]);

    return h(Fragment, {}, [
        h(Input, {
            type: 'text',
            endAdornment,
            value,
            onClick,
        }),
        h('input', {
            type: 'file',
            className: classes.fileInput,
            ref,
            onChange,
        }),
    ]);

    async function onChange(event) {
        const [file] = event.target.files;
        let result   = file.name;

        if (form.format) {
            result = await getFileFormat(form.format, file);
        }

        props.onChange(event, result);
    }

    function onClick(event) {
        event.preventDefault();
        event.stopPropagation();

        if (ref.current) {
            ref.current.click();
        }
    }

    function clear(event) {
        event.preventDefault();
        event.stopPropagation();

        props.onChange(event, '');
    }
}

function getFileFormat(format, file) {
    switch (format) {
        case 'data_url':
            return readAsDataURL(file);
        case 'name':
        default:
            return file.name;
    }
}

function readAsDataURL(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.addEventListener('load', resolve);
        reader.readAsDataURL(file);
    });
}