import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { Trans, useTranslation } from 'react-i18next';

import {
    renderInputField,
    toNumber,
} from '../../../helpers/form';
import { FORM_NAME } from '../../../helpers/constants';
import {
    validateIpv4,
    validateIsPositiveValue,
    validateRequiredValue,
    validateIpv4RangeEnd,
} from '../../../helpers/validators';

const FormDHCPv4 = (props) => {
    const {
        handleSubmit,
        submitting,
        processingConfig,
        clear,
    } = props;

    const { t } = useTranslation();
    const dhcpv4 = useSelector((store) => store.form[FORM_NAME.DHCPv4]);
    const v4 = dhcpv4?.values?.v4 ?? {};
    const dhcpv4Errors = dhcpv4?.syncErrors;

    const dhcpInterfaces = useSelector((store) => store.form[FORM_NAME.DHCP_INTERFACES]);
    const interface_name = dhcpInterfaces?.values?.interface_name ?? {};
    const dhcpInterfacesErrors = dhcpInterfaces?.syncErrors;

    const invalid = !interface_name || dhcpv4Errors || dhcpInterfacesErrors;

    const validateRequired = useCallback((value) => {
        if (!Object.values(v4)
            .some(Boolean)) {
            return undefined;
        }
        return validateRequiredValue(value);
    }, [Object.values(v4)
        .some(Boolean)]);

    return (
        <form onSubmit={handleSubmit}>
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
                            validate={[validateIpv4, validateRequired]}
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
                            validate={[validateIpv4, validateRequired]}
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
                                    validate={[validateIpv4]}
                                />
                            </div>
                            <div className="col">
                                <Field
                                    name="v4.range_end"
                                    component={renderInputField}
                                    type="text"
                                    className="form-control"
                                    placeholder={t('dhcp_form_range_end')}
                                    validate={[validateIpv4, validateIpv4RangeEnd]}
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
                            validate={[validateIsPositiveValue, validateRequired]}
                            normalize={toNumber}
                            min={0}
                        />
                    </div>
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
                    onClick={clear}
                >
                    <Trans>reset_settings</Trans>
                </button>
            </div>
        </form>
    );
};

FormDHCPv4.propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    initialValues: PropTypes.object.isRequired,
    processingConfig: PropTypes.bool.isRequired,
    change: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    clear: PropTypes.func.isRequired,
};

export default reduxForm({
    form: FORM_NAME.DHCPv4,
})(FormDHCPv4);
