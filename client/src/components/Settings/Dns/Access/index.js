import React from 'react';
import { useTranslation } from 'react-i18next';

import { useDispatch, useSelector } from 'react-redux';
import Form from './Form';
import Card from '../../../ui/Card';
import { getAccessList } from '../../../../actions/access';

const Access = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const {
        processing,
        processingSet,
        ...values
    } = useSelector((state) => state.access);

    const handleFormSubmit = (values) => {
        dispatch(getAccessList(values));
    };

    return (
        <Card
            title={t('access_title')}
            subtitle={t('access_desc')}
            bodyType="card-body box-body--settings"
        >
            <Form
                initialValues={values}
                onSubmit={handleFormSubmit}
                processingSet={processingSet}
            />
        </Card>
    );
};

Access.propTypes = {};

export default Access;
