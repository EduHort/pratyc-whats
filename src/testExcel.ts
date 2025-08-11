import { addUserDataToExcel, UserData } from './excel';

/**
 * Esta é uma função de teste autônoma para verificar se a escrita no Excel está funcionando.
 * Ela não depende e não interfere com o bot do WhatsApp.
 */
async function runExcelTest() {
    console.log("--- INICIANDO TESTE DO SERVIÇO DE EXCEL ---");

    // 1. Defina alguns dados de exemplo para adicionar à planilha
    const primeiroUsuario: UserData = {
        numero: '5511911111111',
        nome: 'Carlos Teste da Silva',
        email: 'carlos.teste@exemplo.com'
    };

    const segundoUsuario: UserData = {
        numero: '5521922222222',
        nome: 'Ana Teste de Souza',
        email: 'ana.souza.teste@exemplo.com'
    };

    const terceiroUsuario: UserData = {
        numero: '5531933333333',
        nome: 'Pedro Teste Albuquerque',
        email: 'pedro.a.teste@exemplo.com'
    };

    // 2. Chame a função para cada usuário, uma de cada vez
    try {
        console.log("\n[TESTE] Adicionando o primeiro usuário...");
        await addUserDataToExcel(primeiroUsuario);

        console.log("\n[TESTE] Adicionando o segundo usuário...");
        await addUserDataToExcel(segundoUsuario);

        console.log("\n[TESTE] Adicionando o terceiro usuário...");
        await addUserDataToExcel(terceiroUsuario);

        console.log("\n--- ✅ TESTE CONCLUÍDO COM SUCESSO! ---");
        console.log("Verifique o arquivo 'cadastros_whatsapp_xlsx.xlsx' na raiz do seu projeto.");
        console.log("Ele deve conter os cabeçalhos e três linhas de dados.");

    } catch (error) {
        console.error("\n--- ❌ OCORREU UM ERRO DURANTE O TESTE ---");
        console.error(error);
    }
}

// Executa a função de teste
runExcelTest();