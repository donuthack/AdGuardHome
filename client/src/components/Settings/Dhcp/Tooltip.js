import React from 'react';
import TooltipTrigger from 'react-popper-tooltip';
import propTypes from 'prop-types';
import 'react-popper-tooltip/dist/styles.css';
import { useTranslation } from 'react-i18next';

const Tooltip = ({
    children, content, placement = 'bottom', trigger = 'hover',
}) => {
    const { t } = useTranslation();

    return <TooltipTrigger
        placement={placement} trigger={trigger} tooltip={({
            arrowRef,
            tooltipRef,
            getArrowProps,
            getTooltipProps,
            placement,
        }) => (
        <div {...getTooltipProps({
            ref: tooltipRef,
            className: 'tooltip-container',
        })}>
            <div {...getArrowProps({
                ref: arrowRef,
                className: 'tooltip-arrow',
                'data-placement': placement,
            })} />
            {t(content)}
        </div>
        )}>
        {({ getTriggerProps, triggerRef }) => <span
            {...getTriggerProps({
                ref: triggerRef,
                className: 'trigger',
            })}
        >{children}</span>}
    </TooltipTrigger>;
};

Tooltip.propTypes = {
    children: propTypes.element.isRequired,
    content: propTypes.string.isRequired,
    placement: propTypes.string,
    trigger: propTypes.string,
};

export default Tooltip;
