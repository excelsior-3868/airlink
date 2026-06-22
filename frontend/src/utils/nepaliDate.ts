const nepaliCalendarData: Record<number, number[]> = {
    2070: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    2071: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2072: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2073: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    2074: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    2075: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2076: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2077: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    2078: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    2079: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2080: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2081: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    2082: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    2083: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2084: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2085: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    2086: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    2087: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2088: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2089: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    2090: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30]
};

export function convertADToBS(dateInput: Date | string): { year: number; month: number; day: number } | null {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return null;

    // Baisakh 1, 2070 BS is April 14, 2013 AD
    const refAD = new Date('2013-04-14');
    
    const d1 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const d2 = Date.UTC(refAD.getFullYear(), refAD.getMonth(), refAD.getDate());
    const msPerDay = 24 * 60 * 60 * 1000;
    let diffDays = Math.floor((d1 - d2) / msPerDay);

    let bsYear = 2070;
    let bsMonth = 1;
    let bsDay = 1;

    if (diffDays >= 0) {
        while (diffDays > 0) {
            const months = nepaliCalendarData[bsYear];
            if (!months) break;
            const daysInMonth = months[bsMonth - 1];
            if (diffDays >= daysInMonth) {
                diffDays -= daysInMonth;
                bsMonth++;
                if (bsMonth > 12) {
                    bsMonth = 1;
                    bsYear++;
                }
            } else {
                bsDay += diffDays;
                diffDays = 0;
            }
        }
    } else {
        diffDays = Math.abs(diffDays);
        while (diffDays > 0) {
            bsMonth--;
            if (bsMonth < 1) {
                bsMonth = 12;
                bsYear--;
            }
            const months = nepaliCalendarData[bsYear];
            if (!months) break;
            const daysInMonth = months[bsMonth - 1];
            if (diffDays >= daysInMonth) {
                diffDays -= daysInMonth;
            } else {
                bsDay = daysInMonth - diffDays + 1;
                diffDays = 0;
            }
        }
    }

    return { year: bsYear, month: bsMonth, day: bsDay };
}

export function formatBS(date: Date | string): string {
    const converted = convertADToBS(date);
    if (!converted) return '';
    const m = String(converted.month).padStart(2, '0');
    const d = String(converted.day).padStart(2, '0');
    return `${converted.year}-${m}-${d}`;
}
