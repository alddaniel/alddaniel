/**
 * @fileoverview Service for fetching Brazilian address information based on a postal code (CEP).
 * This service uses the public ViaCEP API.
 */

interface ViaCEPResponse {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    ibge: string;
    gia: string;
    ddd: string;
    siafi: string;
    erro?: boolean;
}

export interface AddressData {
    logradouro: string;
    bairro: string;
    localidade: string;
    uf: string;
}

/**
 * Fetches address information from the ViaCEP API.
 * @param cep The 8-digit postal code string (only numbers).
 * @returns A promise that resolves to an AddressData object or null if not found.
 */
export const fetchAddress = async (cep: string): Promise<AddressData | null> => {
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data: ViaCEPResponse = await response.json();

        if (data.erro) {
            return null;
        }

        return {
            logradouro: data.logradouro,
            bairro: data.bairro,
            localidade: data.localidade,
            uf: data.uf,
        };
    } catch (error) {
        console.error('Failed to fetch address from ViaCEP:', error);
        throw error;
    }
};
