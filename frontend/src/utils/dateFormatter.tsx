import React from 'react';
import { formatBS } from './nepaliDate';

export function formatADBS(
    dateInput: Date | string,
    adFormat: 'default' | 'short' | 'long' = 'default',
    showTime: boolean = false
): React.ReactElement {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return <span>-</span>;

    let adStr = '';
    if (adFormat === 'short') {
        adStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else if (adFormat === 'long') {
        adStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } else {
        adStr = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    }

    if (showTime) {
        adStr += ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    const bsStr = formatBS(date);

    return (
        <div className="flex flex-col leading-tight">
            <span className="font-semibold text-foreground">{adStr}</span>
            <span className="text-xs text-muted-foreground">{bsStr ? `BS: ${bsStr}` : ''}</span>
        </div>
    );
}

export function formatADBSString(
    dateInput: Date | string,
    adFormat: 'default' | 'short' | 'long' = 'default'
): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '-';

    let adStr = '';
    if (adFormat === 'short') {
        adStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else if (adFormat === 'long') {
        adStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } else {
        adStr = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    }

    const bsStr = formatBS(date);
    return bsStr ? `${adStr} (${bsStr})` : adStr;
}

export function formatDateWithSuperscript(dateString: string | Date): React.ReactElement {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return <span>-</span>;

    const day = date.getDate();
    const monthStr = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();

    let suffix = 'th';
    if (day === 1 || day === 21 || day === 31) suffix = 'st';
    else if (day === 2 || day === 22) suffix = 'nd';
    else if (day === 3 || day === 23) suffix = 'rd';

    const bsStr = formatBS(date);

    return (
        <div className="flex flex-col leading-tight">
            <span className="text-foreground text-sm font-semibold">
                {monthStr} {day}<sup>{suffix}</sup>, {year}
            </span>
            <span className="text-xs text-muted-foreground">{bsStr ? `BS: ${bsStr}` : ''}</span>
        </div>
    );
}
