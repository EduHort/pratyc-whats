import fs from 'fs';
import * as xlsx from 'xlsx';
import path from 'path';

// Interface para garantir a estrutura dos dados
export interface UserData {
    numero: string;
    nome: string;
    email: string;
}

// Define o caminho do arquivo de forma consistente
const FILE_PATH = path.resolve(process.cwd(), './cadastros_whatsapp.xlsx');
const WORKSHEET_NAME = 'Cadastros';

/**
 * Adiciona os dados de um usuário a uma planilha usando a biblioteca xlsx.
 * Cria o arquivo e o cabeçalho se não existirem.
 * Adiciona uma nova linha ao final se o arquivo já existir.
 * @param userData Os dados do usuário a serem adicionados.
 */
export async function addUserDataToExcel(userData: UserData): Promise<void> {
    try {
        let workbook: xlsx.WorkBook;

        // 1. Verifica se o arquivo existe para decidir se cria um novo ou lê o existente
        if (fs.existsSync(FILE_PATH)) {
            // Se existe, lê o arquivo para a memória
            const fileBuffer = fs.readFileSync(FILE_PATH);
            workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        } else {
            // Se não existe, cria um novo workbook em branco
            console.log(`[INFO] Arquivo não encontrado. Criando um novo em: ${FILE_PATH}`);
            workbook = xlsx.utils.book_new();
            // Cria uma nova planilha com os cabeçalhos corretos
            const headers = [['Número', 'Nome', 'Email']];
            const worksheet = xlsx.utils.aoa_to_sheet(headers);
            // Anexa a planilha ao workbook
            xlsx.utils.book_append_sheet(workbook, worksheet, WORKSHEET_NAME);
        }

        // 2. Prepara a nova linha e adiciona à planilha
        const worksheet = workbook.Sheets[WORKSHEET_NAME];
        if (!worksheet) {
            // Segurança: se o arquivo existe mas a planilha não, lança um erro.
            throw new Error(`A planilha '${WORKSHEET_NAME}' não foi encontrada no arquivo.`);
        }

        // Converte os dados do objeto para um array na ordem correta
        const newRow = [userData.numero, userData.nome, userData.email];

        // Adiciona a nova linha de dados ao final da planilha existente.
        // { origin: -1 } é a chave para anexar ao final.
        xlsx.utils.sheet_add_aoa(worksheet, [newRow], { origin: -1 });

        // 3. Salva o arquivo com os dados atualizados
        xlsx.writeFile(workbook, FILE_PATH);
        console.log(`[SUCESSO] Dados para "${userData.nome}" adicionados com sucesso à planilha.`);

    } catch (error) {
        console.error('[ERRO] Falha ao processar o arquivo Excel:', error);
        // Lançar o erro permite que a parte que chamou (index.ts) saiba que algo deu errado
        throw error;
    }
}