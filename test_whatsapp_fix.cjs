// Script de Teste - Verificação das Correções do WhatsApp
// Execute com: node test_whatsapp_fix.cjs

require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase (carregado do .env.local)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Erro: Variáveis de ambiente não encontradas!');
    console.error('Certifique-se de que .env.local existe e contém:');
    console.error('  - VITE_SUPABASE_URL');
    console.error('  - VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWhatsAppFix() {
    console.log('🧪 Iniciando testes das correções do WhatsApp...\n');

    try {
        // Teste 1: Verificar estrutura da query
        console.log('📋 Teste 1: Verificando query do AdminDashboard...');
        const { data: appointments, error } = await supabase
            .from('appointments')
            .select(`
                id,
                start_time,
                status,
                user_id,
                profiles:user_id (
                    full_name,
                    phone
                ),
                services:service_id (
                    name,
                    price
                ),
                barbers:barber_id (
                    name
                )
            `)
            .order('start_time', { ascending: true })
            .limit(5);

        if (error) {
            console.error('❌ Erro na query:', error.message);
            return;
        }

        console.log(`✅ Query executada com sucesso! ${appointments?.length || 0} agendamentos encontrados.\n`);

        // Teste 2: Verificar estrutura dos dados
        if (appointments && appointments.length > 0) {
            console.log('📊 Teste 2: Verificando estrutura dos dados...\n');

            appointments.forEach((apt, index) => {
                console.log(`--- Agendamento ${index + 1} ---`);
                console.log(`ID: ${apt.id}`);
                console.log(`Data/Hora: ${apt.start_time}`);
                console.log(`Status: ${apt.status}`);
                console.log(`Cliente: ${apt.profiles?.full_name || 'N/A'}`);
                console.log(`Telefone: ${apt.profiles?.phone || 'SEM TELEFONE ❌'}`);
                console.log(`Serviço: ${apt.services?.name || 'N/A'} - R$ ${apt.services?.price || 0}`);
                console.log(`Barbeiro: ${apt.barbers?.name || 'N/A'}`);

                // Verificar se tem telefone
                if (apt.profiles?.phone) {
                    const whatsappUrl = `https://wa.me/55${apt.profiles.phone.replace(/\D/g, '')}`;
                    console.log(`✅ WhatsApp URL: ${whatsappUrl}`);
                } else {
                    console.log('❌ PROBLEMA: Cliente sem telefone - WhatsApp não funcionará!');
                }
                console.log('');
            });
        } else {
            console.log('⚠️ Nenhum agendamento encontrado no banco de dados.');
            console.log('💡 Crie um agendamento primeiro para testar.');
        }

        // Teste 3: Verificar tabela profiles
        console.log('\n📋 Teste 3: Verificando tabela profiles...');
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, phone')
            .limit(5);

        if (profilesError) {
            console.error('❌ Erro ao buscar profiles:', profilesError.message);
        } else {
            console.log(`✅ ${profiles?.length || 0} perfis encontrados:`);
            profiles?.forEach(profile => {
                console.log(`  - ${profile.full_name || 'Sem nome'}: ${profile.phone || 'SEM TELEFONE ❌'}`);
            });
        }

        // Resumo
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMO DOS TESTES');
        console.log('='.repeat(60));
        console.log(`✅ Query com JOIN: ${error ? 'FALHOU' : 'OK'}`);
        console.log(`✅ Dados de perfil: ${appointments?.[0]?.profiles ? 'OK' : 'FALTANDO'}`);
        console.log(`✅ Telefone disponível: ${appointments?.[0]?.profiles?.phone ? 'OK' : 'FALTANDO'}`);
        console.log('='.repeat(60));

    } catch (err) {
        console.error('❌ Erro durante os testes:', err);
    }
}

// Executar testes
testWhatsAppFix();
