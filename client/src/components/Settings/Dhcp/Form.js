import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { Trans, useTranslation } from 'react-i18next';

import {
    renderInputField,
    toNumber,
    renderSelectField,
} from '../../../helpers/form';
import { resetDhcp } from '../../../actions';
import { FORM_NAME, maxIPv6 } from '../../../helpers/constants';
import {
    validateIpv4,
    validateIpv6,
    validateIsPositiveValue,
    validateRequiredValue,
    validateIpv4RangeEnd,
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

const clearFields = (reset, resetDhcp, t, dispatch) => {
    const fields = {
        interface_name: '',
        v4: {},
        v6: {},
    };

    // eslint-disable-next-line no-alert
    if (window.confirm(t('dhcp_reset'))) {
        Object.keys(fields)
            .forEach((field) => reset(field));
        dispatch(resetDhcp());
    }
};

const Form = (props) => {
    const {
        handleSubmit,
        submitting,
        enabled,
        interfaces,
        processingConfig,
        processingInterfaces,
        reset,
    } = props;

    const dispatch = useDispatch();
    const [t] = useTranslation();
    const interfaceValue = useSelector((store) => store.form[FORM_NAME.DHCP].values.interfaceValue);
    const v4 = useSelector((store) => store.form[FORM_NAME.DHCP].values.v4);
    const v6 = useSelector((store) => store.form[FORM_NAME.DHCP].values.v6);
    const syncErrors = useSelector((store) => store.form[FORM_NAME.DHCP].syncErrors);

    const invalid = syncErrors && (syncErrors.interface_name || (syncErrors.v4 && syncErrors.v6));

    const enteredSomeV4Value = Object.values(v4)
        .some(Boolean);
    const enteredSomeV6Value = Object.values(v6)
        .some(Boolean);

    const requiredV4 = enteredSomeV4Value ? validateRequiredValue : [];
    const requiredV6 = enteredSomeV6Value ? validateRequiredValue : [];

    const requiredV4StartRange = enteredSomeV4Value && !v6.range_start ? validateRequiredValue : [];
    const requiredV6StartRange = enteredSomeV6Value && !v4.range_start ? validateRequiredValue : [];

    return (
        <form onSubmit={handleSubmit}>
            {!processingInterfaces && interfaces
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
            </div>}
            <hr />
            <div className="row">
                <div className="col-lg-6">
                    <div className="form__group form__group--settings">
                        <label>{t('dhcp_form_gateway_input')}</label>
                        <Field
                            name="v4.gateway_ip"
                            component={renderInputField}
                            type="text"
                            className="form-control"
                            placeholder={t('dhcp_form_gateway_input')}
                            validate={[validateIpv4].concat(requiredV4)}
                        />
                    </div>
                    <div className="form__group form__group--settings">
                        <label>{t('dhcp_form_subnet_input')}</label>
                        <Field
                            name="v4.subnet_mask"
                            component={renderInputField}
                            type="text"
                            className="form-control"
                            placeholder={t('dhcp_form_subnet_input')}
                            validate={[validateIpv4].concat(requiredV4)}
                        />
                    </div>
                </div>
                <div className="col-lg-6">
                    <div className="form__group form__group--settings">
                        <div className="row">
                            <div className="col-12">
                                <label>{t('dhcp_form_range_title')}</label>
                            </div>
                            <div className="col">
                                <Field
                                    name="v4.range_start"
                                    component={renderInputField}
                                    type="text"
                                    className="form-control"
                                    placeholder={t('dhcp_form_range_start')}
                                    validate={[validateIpv4].concat(requiredV4StartRange)}
                                />
                            </div>
                            <div className="col">
                                <Field
                                    name="v4.range_end"
                                    component={renderInputField}
                                    type="text"
                                    className="form-control"
                                    placeholder={t('last_octet')}
                                    validate={[validateIpv4, validateIpv4RangeEnd]
                                        .concat(requiredV4)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="form__group form__group--settings">
                        <label>{t('dhcp_form_lease_title')}</label>
                        <Field
                            name="v4.lease_duration"
                            component={renderInputField}
                            type="number"
                            className="form-control"
                            placeholder={t('dhcp_form_lease_input')}
                            validate={[validateIsPositiveValue].concat(requiredV4)}
                            normalize={toNumber}
                            min={0}
                        />
                    </div>
                </div>
            </div>
            <hr />

            <div className="card-header with-border mb-5">
                <div className="card-inner">
                    <div className="card-title">{t('dhcp_ipv6_settings')}</div>
                </div>
            </div>

            <div className="col-lg-6">
                <div className="form__group form__group--settings">
                    <div className="row">
                        <div className="col-12">
                            <label>{t('dhcp_form_range_title')}</label>
                        </div>
                        <div className="col">
                            <Field
                                name="v6.range_start"
                                component={renderInputField}
                                type="text"
                                className="form-control"
                                placeholder={t('dhcp_form_range_start')}
                                validate={[validateIpv6].concat(requiredV6StartRange)}
                            />
                        </div>
                        <div className="col">
                            <Field
                                name="v6.range_end"
                                component="input"
                                type="text"
                                className="form-control disabled cursor--not-allowed"
                                placeholder={maxIPv6}
                                value={maxIPv6}
                                disabled
                            />
                        </div>
                    </div>
                </div>
                <div className="form__group form__group--settings">
                    <label>{t('dhcp_form_lease_title')}</label>
                    <Field
                        name="v6.lease_duration"
                        component={renderInputField}
                        type="number"
                        className="form-control"
                        placeholder={t('dhcp_form_lease_input')}
                        validate={[validateIsPositiveValue].concat(requiredV6)}
                        normalizeOnBlur={toNumber}
                        min={0}
                    />
                </div>
            </div>

            <div className="btn-list">
                <button
                    type="submit"
                    className="btn btn-success btn-standard"
                    disabled={submitting || invalid || processingConfig}
                >
                    {t('save_config')}
                </button>
                <button
                    type="button"
                    className="btn btn-secondary btn-standart"
                    disabled={submitting || processingConfig}
                    onClick={() => clearFields(reset, resetDhcp, t, dispatch)}
                >
                    <Trans>reset_settings</Trans>
                </button>
            </div>
        </form>
    );
};

Form.propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    interfaces: PropTypes.object.isRequired,
    initialValues: PropTypes.object.isRequired,
    processingConfig: PropTypes.bool.isRequired,
    processingInterfaces: PropTypes.bool.isRequired,
    enabled: PropTypes.bool.isRequired,
    change: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
};

export default reduxForm({ form: FORM_NAME.DHCP })(Form);
