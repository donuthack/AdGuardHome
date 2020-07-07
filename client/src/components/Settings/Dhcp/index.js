import React, { useEffect } from 'react';
import classnames from 'classnames';
import { Trans, useTranslation } from 'react-i18next';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { DHCP_STATUS_RESPONSE, FORM_NAME } from '../../../helpers/constants';
import Form from './Form';
import Leases from './Leases';
import StaticLeases from './StaticLeases/index';
import Card from '../../ui/Card';
import Accordion from '../../ui/Accordion';
import PageTitle from '../../ui/PageTitle';
import Loading from '../../ui/Loading';
import {
    findActiveDhcp,
    getDhcpInterfaces,
    getDhcpStatus,
    setDhcpConfig,
    toggleDhcp,
    toggleLeaseModal,
} from '../../../actions';
import Tooltip from './Tooltip';

const Dhcp = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const dhcp = useSelector((store) => store.dhcp, shallowEqual);
    const {
        processingStatus,
        processingConfig,
        processing,
        processingInterfaces,
        interfaces,
        check,
        leases,
        staticLeases,
        isModalOpen,
        processingAdding,
        processingDeleting,
        processingDhcp,
        v4,
        v6,
        enabled,
        interface_name: initialInterfaceName,
        dhcp_available,
    } = dhcp;

    const interface_name = useSelector((store) => store.form[FORM_NAME.DHCP]
        && store.form[FORM_NAME.DHCP].values.interface_name);

    useEffect(() => {
        dispatch(getDhcpStatus());
        dispatch(getDhcpInterfaces());
    }, []);

    const handleFormSubmit = ({
        enabled, interface_name, v4, v6,
    }) => {
        if (!Object.values(v4)
            .some(Boolean)) {
            // eslint-disable-next-line no-param-reassign
            v4 = {};
        }

        if (!Object.values(v6)
            .some(Boolean)) {
            // eslint-disable-next-line no-param-reassign
            v6 = {};
        }

        dispatch(setDhcpConfig({
            enabled,
            interface_name,
            v4,
            v6,
        }));
    };

    const handleToggle = () => {
        const values = {
            enabled,
            interface_name,
            v4: Object.values(v4)
                .some(Boolean) ? v4 : {},
            v6: Object.values(v6)
                .some(Boolean) ? v6 : {},
        };
        dispatch(toggleDhcp(values));
    };

    const getToggleDhcpButton = () => {
        const otherDhcpFound = check?.otherServer
            && check.otherServer.found === DHCP_STATUS_RESPONSE.YES;

        const filledConfig = interface_name && (Object.keys(v4)
            .every(Boolean)
            || Object.keys(v6)
                .every(Boolean));

        if (enabled) {
            return (
                <button
                    type="button"
                    className="btn btn-sm mr-2 btn-gray"
                    onClick={() => dispatch(toggleDhcp({ enabled }))}
                    disabled={processingDhcp || processingConfig}
                >
                    <Trans>dhcp_disable</Trans>
                </button>
            );
        }

        return (
            <button
                type="button"
                className="btn btn-sm mr-2 btn-outline-success"
                onClick={handleToggle}
                disabled={!filledConfig || !check || otherDhcpFound
                || processingDhcp || processingConfig}
            >
                <Trans>dhcp_enable</Trans>
            </button>
        );
    };

    const getActiveDhcpMessage = (t, check) => {
        const { found } = check.otherServer;

        if (found === DHCP_STATUS_RESPONSE.ERROR) {
            return (
                <div className="text-danger mb-2">
                    <Trans>dhcp_error</Trans>
                    <div className="mt-2 mb-2">
                        <Accordion label={t('error_details')}>
                            <span>{check.otherServer.error}</span>
                        </Accordion>
                    </div>
                </div>
            );
        }

        return (
            <div className="mb-2">
                {found === DHCP_STATUS_RESPONSE.YES ? (
                    <div className="text-danger">
                        <Trans>dhcp_found</Trans>
                    </div>
                ) : (
                    <div className="text-secondary">
                        <Trans>dhcp_not_found</Trans>
                    </div>
                )}
            </div>
        );
    };

    const getDhcpWarning = (check) => {
        if (check.otherServer.found === DHCP_STATUS_RESPONSE.NO) {
            return '';
        }

        return (
            <div className="text-danger">
                <Trans>dhcp_warning</Trans>
            </div>
        );
    };

    const getStaticIpWarning = (t, check, interfaceName) => {
        if (check.staticIP.static === DHCP_STATUS_RESPONSE.ERROR) {
            return (
                <>
                    <div className="text-danger mb-2">
                        <Trans>dhcp_static_ip_error</Trans>
                        <div className="mt-2 mb-2">
                            <Accordion label={t('error_details')}>
                                <span>{check.staticIP.error}</span>
                            </Accordion>
                        </div>
                    </div>
                    <hr className="mt-4 mb-4" />
                </>
            );
        }
        if (check.staticIP.static === DHCP_STATUS_RESPONSE.NO && check.staticIP.ip
            && interfaceName) {
            return (
                <>
                    <div className="text-secondary mb-2">
                        <Trans
                            components={[<strong key="0">example</strong>]}
                            values={{
                                interfaceName,
                                ipAddress: check.staticIP.ip,
                            }}
                        >
                            dhcp_dynamic_ip_found
                        </Trans>
                    </div>
                    <hr className="mt-4 mb-4" />
                </>
            );
        }

        return '';
    };

    const statusButtonClass = classnames('btn btn-sm', {
        'btn-loading btn-primary': processingStatus,
        'btn-outline-primary': !processingStatus,
    });

    const onClick = () => dispatch(findActiveDhcp(interface_name));

    const toggleModal = () => dispatch(toggleLeaseModal());

    const {
        gateway_ip,
        subnet_mask,
        range_start,
        range_end,
        lease_duration,
    } = v4;

    const initialV4Values = {
        gateway_ip,
        subnet_mask,
        range_start,
        range_end,
        lease_duration,
    };

    const initialV4 = Object.values(initialV4Values)
        .some(Boolean) ? initialV4Values : {};

    const initialV6 = Object.values(v6)
        .some(Boolean)
        ? {
            range_start: v6.range_start,
            lease_duration: v6.lease_duration,
        } : {};

    const initialValues = {
        interface_name: initialInterfaceName,
        enabled,
        v4: initialV4,
        v6: initialV6,
    };

    if (processing || processingInterfaces) {
        return <Loading />;
    }

    if (!processing && !dhcp_available) {
        return <h2 className='text-center mt-5'><Trans>unavailable_dhcp</Trans></h2>;
    }

    const toggleDhcpButton = getToggleDhcpButton();

    return (
        <>
            <PageTitle title={t('dhcp_settings')} subtitle={t('dhcp_description')}>
                <div className="page-title__actions">
                    <div className="card-actions mb-3">
                        {check ? toggleDhcpButton : <Tooltip content='setup_config_to_enable_dhcp_server'>{toggleDhcpButton}</Tooltip>}
                        <button
                            type="button"
                            className={statusButtonClass}
                            onClick={onClick}
                            disabled={enabled || !interface_name || processingConfig}
                        >
                            <Trans>check_dhcp_servers</Trans>
                        </button>
                    </div>
                </div>
            </PageTitle>
            {!processing && !processingInterfaces && (
                <>
                    <Card
                        title={t('dhcp_ipv4_settings')}
                        bodyType="card-body box-body--settings"
                    >
                        <div>
                            <Form
                                onSubmit={handleFormSubmit}
                                initialValues={initialValues}
                                interfaces={interfaces}
                                processingConfig={processingConfig}
                                processingInterfaces={processingInterfaces}
                                enabled={enabled}
                            />
                            {!enabled && check && (
                                <>
                                    <hr />
                                    {getStaticIpWarning(t, check, interface_name)}
                                    {getActiveDhcpMessage(t, check)}
                                    {getDhcpWarning(check)}
                                </>
                            )}
                        </div>
                    </Card>
                    {enabled && (
                        <Card
                            title={t('dhcp_leases')}
                            bodyType="card-body box-body--settings"
                        >
                            <div className="row">
                                <div className="col">
                                    <Leases leases={leases} />
                                </div>
                            </div>
                        </Card>
                    )}
                    <Card
                        title={t('dhcp_static_leases')}
                        bodyType="card-body box-body--settings"
                    >
                        <div className="row">
                            <div className="col-12">
                                <StaticLeases
                                    staticLeases={staticLeases}
                                    isModalOpen={isModalOpen}
                                    processingAdding={processingAdding}
                                    processingDeleting={processingDeleting}
                                />
                            </div>
                            <div className="col-12">
                                <button
                                    type="button"
                                    className="btn btn-success btn-standard mt-3"
                                    onClick={toggleModal}
                                >
                                    <Trans>dhcp_add_static_lease</Trans>
                                </button>
                            </div>
                        </div>
                    </Card>
                </>
            )}
        </>
    );
};

Dhcp.propTypes = {};

export default Dhcp;
