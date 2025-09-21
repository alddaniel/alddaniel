/**
 * @fileoverview Service for fetching Brazilian company information based on a CNPJ.
 * This service uses the public BrasilAPI.
 */

interface BrasilAPIResponse {
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
    email: string | null;
    // ... other fields exist but are not used
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
 * Fetches company information from the BrasilAPI.
 * @param cnpj The 14-digit CNPJ string (only numbers).
 * @returns A promise that resolves to a CompanyData object or null if not found.
 */
export const fetchCompanyData = async (cnpj: string): Promise<CompanyData | null> => {
    const cleanedCnpj = cnpj.replace(/\D/g, '');
    if (cleanedCnpj.length !== 14) {
        return null;
    }

    try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanedCnpj}`);
        if (!response.ok) {
            // BrasilAPI returns 404 for not found, which is a valid scenario.
            if (response.status === 404) return null;
            throw new Error('Network response was not ok');
        }
        const data: BrasilAPIResponse = await response.json();

        if (data.erro) {
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
            email: data.email || '',
            cep: data.cep?.replace(/\D/g, '') || '',
            address: fullAddress,
        };
    } catch (error) {
        console.error('Failed to fetch company data from BrasilAPI:', error);
        throw error;
    }
};
