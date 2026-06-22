import { useState, useRef, useEffect, useCallback, type ReactElement } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { convertADToBS } from '@/utils/nepaliDate';

// ─── Nepali calendar data ────────────────────────────────────────────────────
const BS_DATA: Record<number, number[]> = {
    2070: [31,31,31,32,31,31,30,29,30,29,30,30],
    2071: [31,31,32,31,31,31,30,29,30,29,30,30],
    2072: [31,32,31,32,31,30,30,29,30,29,30,30],
    2073: [31,32,31,32,31,30,30,30,29,29,30,30],
    2074: [31,31,31,32,31,31,30,29,30,29,30,30],
    2075: [31,31,32,31,31,31,30,29,30,29,30,30],
    2076: [31,32,31,32,31,30,30,29,30,29,30,30],
    2077: [31,32,31,32,31,30,30,30,29,29,30,30],
    2078: [31,31,31,32,31,31,30,29,30,29,30,30],
    2079: [31,31,32,31,31,31,30,29,30,29,30,30],
    2080: [31,32,31,32,31,30,30,29,30,29,30,30],
    2081: [31,32,31,32,31,30,30,30,29,29,30,30],
    2082: [31,31,31,32,31,31,30,29,30,29,30,30],
    2083: [31,31,32,31,31,31,30,29,30,29,30,30],
    2084: [31,32,31,32,31,30,30,29,30,29,30,30],
    2085: [31,32,31,32,31,30,30,30,29,29,30,30],
    2086: [31,31,31,32,31,31,30,29,30,29,30,30],
    2087: [31,31,32,31,31,31,30,29,30,29,30,30],
    2088: [31,32,31,32,31,30,30,29,30,29,30,30],
    2089: [31,32,31,32,31,30,30,30,29,29,30,30],
    2090: [31,31,31,32,31,31,30,29,30,29,30,30],
};

const BS_MONTHS = ['Baisakh','Jestha','Ashadh','Shrawan','Bhadra','Ashwin','Kartik','Mangsir','Poush','Magh','Falgun','Chaitra'];
const AD_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// Reference: BS 2070-01-01 = AD 2013-04-14
const BS_REF = { year: 2070, month: 1, day: 1 };
const AD_REF = new Date(2013, 3, 14);

function bsToAd(bsY: number, bsM: number, bsD: number): Date {
    let totalDays = bsD - 1;
    let y = BS_REF.year, m = BS_REF.month;
    while (y < bsY || (y === bsY && m < bsM)) {
        const days = BS_DATA[y]?.[m - 1] ?? 30;
        totalDays += days;
        m++;
        if (m > 12) { m = 1; y++; }
    }
    const result = new Date(AD_REF);
    result.setDate(AD_REF.getDate() + totalDays);
    return result;
}

function getDaysInBsMonth(y: number, m: number): number {
    return BS_DATA[y]?.[m - 1] ?? 30;
}

function getBsFirstWeekday(y: number, m: number): number {
    const ad = bsToAd(y, m, 1);
    return ad.getDay();
}

function adToYmd(d: Date): { y: number; m: number; day: number } {
    return { y: d.getFullYear(), m: d.getMonth() + 1, day: d.getDate() };
}

function padZ(n: number): string { return String(n).padStart(2, '0'); }
function toIso(y: number, m: number, d: number): string { return `${y}-${padZ(m)}-${padZ(d)}`; }

// ─── Props ───────────────────────────────────────────────────────────────────
interface DatePickerProps {
    /** Controlled value: YYYY-MM-DD string (AD) or empty string */
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    label?: string;
    id?: string;
    className?: string;
}

// ─── Calendera Component ─────────────────────────────────────────────────────
export default function DatePicker({
    value,
    onChange,
    placeholder = 'Select date',
    label,
    id,
    className = '',
}: DatePickerProps) {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<'AD' | 'BS'>('AD');
    const wrapRef = useRef<HTMLDivElement>(null);

    // AD calendar state
    const today = new Date();
    const [adView, setAdView] = useState<{ y: number; m: number }>({
        y: today.getFullYear(),
        m: today.getMonth() + 1,
    });

    // BS calendar state
    const todayBs = convertADToBS(today);
    const [bsView, setBsView] = useState<{ y: number; m: number }>({
        y: todayBs?.year ?? 2081,
        m: todayBs?.month ?? 1,
    });

    // Sync calendar view when value changes externally
    useEffect(() => {
        if (value) {
            const d = new Date(value);
            if (!isNaN(d.getTime())) {
                setAdView({ y: d.getFullYear(), m: d.getMonth() + 1 });
                const bs = convertADToBS(d);
                if (bs) setBsView({ y: bs.year, m: bs.month });
            }
        }
    }, [value]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // ── Display value in the trigger ─────────────────────────────────────────
    const displayValue = useCallback(() => {
        if (!value) return '';
        const d = new Date(value);
        if (isNaN(d.getTime())) return value;
        if (mode === 'AD') {
            return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } else {
            const bs = convertADToBS(d);
            if (!bs) return value;
            return `${bs.year}-${padZ(bs.month)}-${padZ(bs.day)} BS`;
        }
    }, [value, mode]);

    // ── AD calendar helpers ──────────────────────────────────────────────────
    const adFirstWeekday = new Date(adView.y, adView.m - 1, 1).getDay();
    const adDaysInMonth  = new Date(adView.y, adView.m, 0).getDate();

    const handleAdDayClick = (day: number) => {
        onChange(toIso(adView.y, adView.m, day));
        setOpen(false);
    };

    const isAdSelected = (day: number) => {
        if (!value) return false;
        const d = new Date(value);
        return d.getFullYear() === adView.y && d.getMonth() + 1 === adView.m && d.getDate() === day;
    };

    const isAdToday = (day: number) =>
        today.getFullYear() === adView.y && today.getMonth() + 1 === adView.m && today.getDate() === day;

    // ── BS calendar helpers ──────────────────────────────────────────────────
    const bsDays    = getDaysInBsMonth(bsView.y, bsView.m);
    const bsFirstWd = getBsFirstWeekday(bsView.y, bsView.m);

    const handleBsDayClick = (day: number) => {
        const ad = bsToAd(bsView.y, bsView.m, day);
        const { y, m, day: d } = adToYmd(ad);
        onChange(toIso(y, m, d));
        setOpen(false);
    };

    const isBsSelected = (day: number) => {
        if (!value) return false;
        const bs = convertADToBS(new Date(value));
        return bs?.year === bsView.y && bs?.month === bsView.m && bs?.day === day;
    };

    const isBsToday = (day: number) =>
        todayBs?.year === bsView.y && todayBs?.month === bsView.m && todayBs?.day === day;

    // ── Navigation ───────────────────────────────────────────────────────────
    const prevMonth = () => {
        if (mode === 'AD') {
            setAdView(v => v.m === 1 ? { y: v.y - 1, m: 12 } : { ...v, m: v.m - 1 });
        } else {
            setBsView(v => v.m === 1 ? { y: v.y - 1, m: 12 } : { ...v, m: v.m - 1 });
        }
    };

    const nextMonth = () => {
        if (mode === 'AD') {
            setAdView(v => v.m === 12 ? { y: v.y + 1, m: 1 } : { ...v, m: v.m + 1 });
        } else {
            setBsView(v => v.m === 12 ? { y: v.y + 1, m: 1 } : { ...v, m: v.m + 1 });
        }
    };

    const handleToday = () => {
        const { y, m, day } = adToYmd(today);
        onChange(toIso(y, m, day));
        setAdView({ y, m });
        const bs = convertADToBS(today);
        if (bs) setBsView({ y: bs.year, m: bs.month });
        setOpen(false);
    };

    const handleClear = () => { onChange(''); };

    // ── Render day grid ──────────────────────────────────────────────────────
    const renderGrid = (
        totalDays: number,
        firstWeekday: number,
        isSelected: (d: number) => boolean,
        isToday: (d: number) => boolean,
        onClick: (d: number) => void,
    ) => {
        const cells: ReactElement[] = [];

        // Empty leading cells
        for (let i = 0; i < firstWeekday; i++) {
            cells.push(<div key={`e-${i}`} />);
        }

        // Day cells
        for (let d = 1; d <= totalDays; d++) {
            const selected = isSelected(d);
            const todayCell = isToday(d);
            cells.push(
                <button
                    key={d}
                    type="button"
                    onClick={() => onClick(d)}
                    className={[
                        'relative h-8 w-8 rounded-full text-sm font-medium',
                        'flex items-center justify-center mx-auto',
                        'transition-all duration-150 focus:outline-none',
                        selected
                            ? 'bg-red-600 text-white shadow-md shadow-red-300 scale-105'
                            : todayCell
                            ? 'ring-2 ring-red-400 text-red-600 font-bold'
                            : 'text-slate-700 hover:bg-red-50 hover:text-red-600',
                    ].join(' ')}
                >
                    {d}
                </button>
            );
        }
        return cells;
    };

    // Month label parts (separate for the "Mon | Year" display)
    const monthName = mode === 'AD'
        ? AD_MONTHS[adView.m - 1].slice(0, 3)
        : BS_MONTHS[bsView.m - 1];
    const yearNum = mode === 'AD' ? adView.y : bsView.y;

    return (
        <div ref={wrapRef} className={`relative inline-block ${className}`}>
            {label && (
                <label
                    htmlFor={id}
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                    {label}
                </label>
            )}

            {/* ── Trigger button ── */}
            <button
                id={id}
                type="button"
                onClick={() => setOpen(o => !o)}
                className="
                    flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background
                    text-sm text-left w-full min-w-[160px]
                    hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200
                    transition-all duration-150
                "
            >
                <CalendarDays className="size-4 text-red-500 shrink-0" />
                <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
                    {displayValue() || placeholder}
                </span>
            </button>

            {/* ── Calendar Popup ── */}
            {open && (
                <div className="
                    absolute z-50 mt-2 left-0 w-[272px]
                    rounded-2xl border border-slate-200/80 dark:border-slate-700/60
                    bg-white dark:bg-slate-900
                    shadow-[0_20px_50px_-10px_rgba(0,0,0,0.20),0_8px_20px_-6px_rgba(0,0,0,0.12)]
                    overflow-hidden
                    animate-in fade-in-0 zoom-in-95 duration-150
                ">

                    {/* ── Top bar: Today / Clear / AD-BS toggle ── */}
                    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={handleToday}
                                className="
                                    text-xs font-semibold text-red-600
                                    hover:bg-red-50 dark:hover:bg-red-950/30
                                    rounded-lg px-2.5 py-1 transition-colors
                                "
                            >
                                Today
                            </button>
                            <button
                                type="button"
                                onClick={handleClear}
                                className="
                                    text-xs font-medium text-slate-500 dark:text-slate-400
                                    hover:bg-slate-100 dark:hover:bg-slate-800
                                    rounded-lg px-2.5 py-1 transition-colors
                                "
                            >
                                Clear
                            </button>
                        </div>

                        {/* AD / BS pill toggle */}
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setMode('AD')}
                                className={[
                                    'text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-all duration-150',
                                    mode === 'AD'
                                        ? 'bg-red-600 text-white shadow-sm'
                                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700',
                                ].join(' ')}
                            >
                                AD
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('BS')}
                                className={[
                                    'text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-all duration-150',
                                    mode === 'BS'
                                        ? 'bg-red-600 text-white shadow-sm'
                                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700',
                                ].join(' ')}
                            >
                                BS
                            </button>
                        </div>
                    </div>

                    {/* ── Month / Year navigation ── */}
                    <div className="flex items-center justify-between px-3 py-3">
                        <button
                            type="button"
                            onClick={prevMonth}
                            className="
                                h-7 w-7 flex items-center justify-center rounded-full
                                hover:bg-red-50 dark:hover:bg-slate-800
                                text-slate-500 hover:text-red-600
                                transition-colors
                            "
                        >
                            <ChevronLeft className="size-4" />
                        </button>

                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-wide">
                                {monthName}
                            </span>
                            <span className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-0.5 rounded-full" />
                            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-wide">
                                {yearNum}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={nextMonth}
                            className="
                                h-7 w-7 flex items-center justify-center rounded-full
                                hover:bg-red-50 dark:hover:bg-slate-800
                                text-slate-500 hover:text-red-600
                                transition-colors
                            "
                        >
                            <ChevronRight className="size-4" />
                        </button>
                    </div>

                    {/* ── Day-of-week headers ── */}
                    <div className="grid grid-cols-7 px-3 pb-1">
                        {DAYS.map(d => (
                            <div
                                key={d}
                                className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 py-1 tracking-wide"
                            >
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* ── Date grid ── */}
                    <div className="grid grid-cols-7 px-3 pb-4 gap-y-0.5">
                        {mode === 'AD'
                            ? renderGrid(adDaysInMonth, adFirstWeekday, isAdSelected, isAdToday, handleAdDayClick)
                            : renderGrid(bsDays, bsFirstWd, isBsSelected, isBsToday, handleBsDayClick)}
                    </div>
                </div>
            )}
        </div>
    );
}
