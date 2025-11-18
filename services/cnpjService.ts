/**
 * @fileoverview Service for fetching company information based on a national tax identifier.
 * This service uses the public BrasilAPI (v1) for Brazil and mocks data for Argentina.
 */

// Interface adapted for v1 response
interface BrasilAPIV1Response {
    cnpj: string;
    razao_social: string;
    nome_fantasia: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    municipio: string;
    uf: string;
    cep: string;
    ddd_telefone_1: string;
    email: string | null; // email is present in v1
    erro?: any;
}

export interface CompanyData {
    name: string;
    phone: string;
    email: string;
    cep: string;
    address: string;
}

/**
 * Fetches Brazilian company information from the BrasilAPI.
 * @param cnpj The 14-digit CNPJ string (only numbers).
 * @returns A promise that resolves to a CompanyData object or null if not found.
 */
export const fetchBrazilianCompanyData = async (cnpj: string): Promise<CompanyData | null> => {
    const cleanedCnpj = cnpj.replace(/\D/g, '');
    if (cleanedCnpj.length !== 14) {
        return null;
    }

    try {
        const url = `https://brasilapi.com.br/api/cnpj/v1/${cleanedCnpj}`; // Reverted to v1 endpoint
        const response = await fetch(url);
        
        if (response.status === 404) {
            return null;
        }
        if (!response.ok) {
            console.error(`BrasilAPI CNPJ fetch failed with status: ${response.status} ${response.statusText}`);
            return null;
        }
        
        const data: BrasilAPIV1Response = await response.json();

        // Check for application-level errors returned in the JSON body
        if (data.erro) {
            console.error('BrasilAPI returned an error in the response body:', data.erro);
            return null;
        }

        const addressParts = [
            data.logradouro,
            data.numero,
            data.complemento,
            data.bairro,
        ].filter(Boolean).join(', ');

        const fullAddress = `${addressParts} - ${data.municipio}/${data.uf}`;

        return {
            name: data.razao_social || data.nome_fantasia || '',
            phone: data.ddd_telefone_1 || '',
            email: data.email || '', // Using email from v1 response
            cep: data.cep?.replace(/\D/g, '') || '',
            address: fullAddress,
        };
    } catch (error) {
        console.error('Failed to fetch company data from BrasilAPI:', error);
        // Do not re-throw the error to avoid breaking the UI flow. Autofill is a non-critical feature.
        return null;
    }
};

/**
 * Fetches Argentinian company information (mocked).
 * @param cuit The 11-digit CUIT string (only numbers).
 * @returns A promise that resolves to a mocked CompanyData object or null if not found.
 */
export const fetchArgentinianCompanyData = async (cuit: string): Promise<CompanyData | null> => {
    const cleanedCuit = cuit.replace(/\D/g, '');
    // Using a known CUIT for Mercado Libre as a mock
    if (cleanedCuit !== '30709303122') {
        return null;
    }

    console.log(`Simulating fetch for Argentinian CUIT: ${cleanedCuit}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
        name: 'Mercado Libre S.R.L.',
        phone: '11 4640-8000',
        email: 'ayuda@mercadolibre.com.ar',
        cep: 'C1425BJH', // This is a CPA
        address: 'Arias 3751, Piso 7, Buenos Aires'
    };
};