import { useLocalization } from '../contexts/LocalizationContext';

/**
 * @fileoverview Service for fetching national holiday information.
 * This service uses the public BrasilAPI.
 */

export interface Holiday {
    date: Date;
    name: string;
    type: string;
}

interface BrasilAPIHolidayResponse {
    date: string; // YYYY-MM-DD
    name: string;
    type: string;
}

/**
 * Fetches Brazilian national holidays for a given year from BrasilAPI.
 * @param year The four-digit year.
 * @returns A promise that resolves to an array of Holiday objects or an empty array on failure.
 */
export const fetchNationalHolidays = async (year: number): Promise<Holiday[]> => {
    // Only fetch for Brazilian locale for now
    // A check for `locale.startsWith('pt')` should be done before calling this function.
    try {
        const url = `https://brasilapi.com.br/api/feriados/v1/${year}`;
        const response = await fetch(url);

        if (!response.ok) {
            console.error(`BrasilAPI Feriados fetch failed with status: ${response.status}`);
            return [];
        }

        const data: BrasilAPIHolidayResponse[] = await response.json();

        return data.map(holiday => {
            // Split date string to avoid timezone issues with `new Date('YYYY-MM-DD')`
            const [y, m, d] = holiday.date.split('-').map(Number);
            return {
                ...holiday,
                date: new Date(y, m - 1, d),
            };
        });

    } catch (error) {
        console.error('Failed to fetch holidays from BrasilAPI:', error);
        return [];
    }
};