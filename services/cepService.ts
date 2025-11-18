/**
 * @fileoverview Service for fetching address information based on a postal code.
 * This service now uses the public BrasilAPI for Brazil and mocks data for Argentina.
 */
import { validateCPA } from './validationService';

interface BrasilAPIResponse {
    cep: string;
    state: string;
    city: string;
    neighborhood: string;
    street: string;
    service: string;
    error?: {
      name: string;
      message: string;
      type: string;
    }
}

export interface AddressData {
    logradouro: string;
    bairro: string;
    localidade: string;
    uf: string;
}

/**
 * Fetches Brazilian address information from the BrasilAPI.
 * @param cep The 8-digit postal code string (only numbers).
 * @returns A promise that resolves to an AddressData object or null if not found.
 */
export const fetchBrazilianAddress = async (cep: string): Promise<AddressData | null> => {
    const cleanedCep = cep.replace(/\D/g, '');
    if (cleanedCep.length !== 8) {
        return null;
    }

    try {
        const url = `https://brasilapi.com.br/api/cep/v2/${cleanedCep}`;
        const response = await fetch(url);

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            console.error(`BrasilAPI CEP fetch failed with status: ${response.status}`);
            return null;
        }
        
        const data: BrasilAPIResponse = await response.json();

        if (data.error) {
            console.error(`BrasilAPI returned an error: ${data.error.message}`);
            return null;
        }

        return {
            logradouro: data.street,
            bairro: data.neighborhood,
            localidade: data.city,
            uf: data.state,
        };
    } catch (error) {
        console.error('Failed to fetch address from BrasilAPI:', error);
        return null;
    }
};


// Map from province code to province name
const ARGENTINIAN_PROVINCES: Record<string, string> = {
    A: "Salta",
    B: "Buenos Aires",
    C: "Ciudad Autónoma de Buenos Aires",
    D: "San Luis",
    E: "Entre Ríos",
    F: "Santa Fe",
    G: "Mendoza",
    H: "Chaco",
    J: "San Juan",
    K: "Catamarca",
    L: "La Pampa",
    M: "Misiones",
    N: "Neuquén",
    P: "La Rioja",
    Q: "Río Negro",
    R: "Córdoba",
    S: "Santa Cruz",
    T: "Tucumán",
    U: "Chubut",
    V: "Santiago del Estero",
    W: "Corrientes",
    X: "Córdoba",
    Y: "Jujuy",
    Z: "Tierra del Fuego"
};


/**
 * Fetches Argentinian address information (mocked).
 * @param cpa The Argentinian Postal Code (CPA).
 * @returns A promise that resolves to a mocked AddressData object or null if not found.
 */
export const fetchArgentinianAddress = async (cpa: string): Promise<AddressData | null> => {
    const cleanedCpa = cpa.replace(/\s/g, '').toUpperCase();
    
    if (!validateCPA(cleanedCpa)) {
        return null;
    }
    
    console.log(`Simulating fetch for Argentinian CPA: ${cleanedCpa}`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    const provinceCode = cleanedCpa.charAt(0);
    const numericPart = cleanedCpa.substring(1, 5);
    
    const mockData: Record<string, AddressData> = {
        'C1000AAA': { logradouro: 'Avenida de Mayo 500', bairro: 'Centro', localidade: 'CABA', uf: 'C' },
        'B1900XYZ': { logradouro: 'Calle 7 776', bairro: 'La Plata Centro', localidade: 'La Plata', uf: 'B' },
        'K4700ABC': { logradouro: 'Sarmiento 500', bairro: 'Centro', localidade: 'San Fernando del Valle de Catamarca', uf: 'K' },
        'T4000IAN': { logradouro: '24 de Septiembre 500', bairro: 'Centro', localidade: 'San Miguel de Tucumán', uf: 'T' },
        'C1425BJH': { logradouro: 'Av. del Libertador 3883', bairro: 'Palermo', localidade: 'CABA', uf: 'C' },
    };

    if (mockData[cleanedCpa]) {
        return mockData[cleanedCpa];
    }
    
    const provinceName = ARGENTINIAN_PROVINCES[provinceCode];
    if (provinceName) {
        return {
            logradouro: `Calle Ficticia ${numericPart}`,
            bairro: 'Barrio Genérico',
            localidade: provinceName,
            uf: provinceCode,
        };
    }

    return null;
};