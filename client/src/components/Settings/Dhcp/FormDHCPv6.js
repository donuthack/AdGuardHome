import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { Trans, useTranslation } from 'react-i18next';

import {
    renderInputField,
    toNumber,
} from '../../../helpers/form';
import { FORM_NAME, maxIPv6 } from '../../../helpers/constants';
import {
    validateIpv6,
    validateIsPositiveValue,
    validateRequiredValue,
} from '../../../helpers/validators';

const FormDHCPv6 = (props) => {
    const {
        handleSubmit,
        submitting,
        processingConfig,
        clear,
    } = props;

    const { t } = useTranslation();
    const dhcpv6 = useSelector((store) => store.form[FORM_NAME.DHCPv6]);
    const v6 = dhcpv6?.values?.v6 ?? {};
    const dhcpv6Errors = dhcpv6?.syncErrors;

    const dhcpInterfaces = useSelector((store) => store.form[FORM_NAME.DHCP_INTERFACES]);
    const interface_name = dhcpInterfaces?.values?.interface_name ?? {};
    const dhcpInterfacesErrors = dhcpInterfaces?.syncErrors;

    const invalid = !interface_name || dhcpv6Errors || dhcpInterfacesErrors;

    const validateRequired = useCallback((value) => {
        if (!Object.values(v6)
            .some(Boolean)) {
            return undefined;
        }
        return validateRequiredValue(value);
    }, [Object.values(v6)
        .some(Boolean)]);


    return (
        <form onSubmit={handleSubmit}>
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
                                validate={[validateIpv6, validateRequired]}
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
                        validate={[validateIsPositiveValue, validateRequired]}
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
                    onClick={clear}
                >
                    <Trans>reset_settings</Trans>
                </button>
            </div>
        </form>
    );
};

FormDHCPv6.propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    initialValues: PropTypes.object.isRequired,
    processingConfig: PropTypes.bool.isRequired,
    change: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    clear: PropTypes.func.isRequired,
};

export default reduxForm({
    form: FORM_NAME.DHCPv6,
})(FormDHCPv6);
