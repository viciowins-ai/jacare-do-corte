// import { supabase } from '../lib/supabase';

export type UserRole = 'master' | 'admin' | 'barber' | 'client';

export const PERMISSIONS = {
    master: {
        canDeleteDatabase: true,
        canChangePricing: true,
        canBanUsers: true,
        canViewAllData: true,
        sessionLimit: 999
    },
    admin: { // O Dono (viciowins)
        canDeleteDatabase: false,
        canChangePricing: false,
        canBanUsers: false, // Pode bloquear clientes, mas não barbeiros/master
        canViewAllData: true, // Vê faturamento da própria loja
        sessionLimit: 1 // SESSÃO ÚNICA!
    },
    barber: {
        canDeleteDatabase: false,
        canChangePricing: false,
        canBanUsers: false,
        canViewAllData: false, // Só vê a própria agenda
        sessionLimit: 1
    },
    client: {
        canDeleteDatabase: false,
        canChangePricing: false,
        canBanUsers: false,
        canViewAllData: false,
        sessionLimit: 5 // Clientes podem logar em iPad + Celular sem problemas
    }
};

export async function getUserRole(email: string | undefined): Promise<UserRole> {
    if (!email) return 'client';

    // Hardcoded Master Email (Segurança Máxima)
    if (email === 'araucariainforma@gmail.com') return 'master';

    // Hardcoded Admin Email (O Dono)
    if (email === 'wagner.oliveira.mendes@escola.pr.gov.br') return 'admin';

    // Futuramente, buscaremos do banco se tivermos barbeiros cadastrados
    // const { data } = await supabase.from('users').select('role').eq('email', email).single();
    // return data?.role || 'client';

    return 'client';
}
