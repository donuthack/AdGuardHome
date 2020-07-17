import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { Trans, useTranslation } from 'react-i18next';

import {
    renderSelectField,
} from '../../../helpers/form';
import { FORM_NAME } from '../../../helpers/constants';
import {
    validateRequiredValue,
} from '../../../helpers/validators';

const renderInterfaces = ((interfaces) => (
    Object.keys(interfaces)
        .map((item) => {
            const option = interfaces[item];
            const { name } = option;
            const onlyIPv6 = option.ip_addresses.every((ip) => ip.includes(':'));
            let interfaceIP = option.ip_addresses[0];

            if (!onlyIPv6) {
                option.ip_addresses.forEach((ip) => {
                    if (!ip.includes(':')) {
                        interfaceIP = ip;
                    }
                });
            }

            return (
                <option value={name} key={name} disabled={onlyIPv6}>
                    {name} - {interfaceIP}
                </option>
            );
        })
));

const renderInterfaceValues = ((interfaceValues) => (
    <ul className="list-unstyled mt-1 mb-0">
        <li>
            <span className="interface__title">MTU: </span>
            {interfaceValues.mtu}
        </li>
        <li>
            <span className="interface__title"><Trans>dhcp_hardware_address</Trans>: </span>
            {interfaceValues.hardware_address}
        </li>
        <li>
            <span className="interface__title"><Trans>dhcp_ip_addresses</Trans>: </span>
            {interfaceValues.ip_addresses
                .map((ip) => <span key={ip} className="interface__ip">{ip}</span>)}
        </li>
    </ul>
));

const Interfaces = () => {
    const {
        processingInterfaces,
        interfaces,
        enabled,
    } = useSelector((store) => store.dhcp, shallowEqual);

    const { t } = useTranslation();
    const interfaceValue = useSelector(
        (store) => store.form[FORM_NAME.DHCP_INTERFACES]?.values?.interface_name,
    );

    return !processingInterfaces && interfaces
        && <div className="row">
            <div className="col-sm-12 col-md-6">
                <div className="form__group form__group--settings">
                    <Field
                        name="interface_name"
                        component={renderSelectField}
                        className="form-control custom-select"
                        validate={[validateRequiredValue]}
                        label='dhcp_interface_select'
                    >
                        <option value="" disabled={enabled}>
                            {t('dhcp_interface_select')}
                        </option>
                        {renderInterfaces(interfaces)}
                    </Field>
                </div>
            </div>
            {interfaceValue
            && <div className="col-sm-12 col-md-6">
                {interfaces[interfaceValue]
                && renderInterfaceValues(interfaces[interfaceValue])}
            </div>}
        </div>;
};

Interfaces.propTypes = {};

export default reduxForm({
    form: FORM_NAME.DHCP_INTERFACES,
})(Interfaces);
