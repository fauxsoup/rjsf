import { createElement as h } from 'react';

import { useDecorator, useLocalizer } from '../../context';
import { FormType } from '../../types';

/**
 * @component Help
 */
export default function Help(props) {
    const { form } = props;
    const { description } = form;

    const localize = useLocalizer();
    const deco = useDecorator();
    const title = localize.getLocalizedString(form.title);

    return h(
        deco.Text,
        { form, title },
        localize.getLocalizedString(description)
    );
}

Help.propTypes = {
    form: FormType,
};
