import ExcelJS from 'exceljs';
import path from 'path';

// Define uma interface para garantir que os dados sempre terão o mesmo formato
export interface UserData {
    numero: string;
    nome: string;
    email: string;
}

const FILE_NAME = 'cadastros_whatsapp.xlsx';
const WORKSHEET_NAME = 'Cadastros';

/**
 * Adiciona ou atualiza um arquivo Excel com os dados de um usuário.
 * Cria o arquivo e o cabeçalho se não existirem.
 * @param userData - Os dados do usuário a serem adicionados.
 */
export async function addUserDataToExcel(userData: UserData): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const filePath = path.resolve(process.cwd(), FILE_NAME);

    try {
        // Tenta ler o arquivo existente. Se falhar, um novo será criado.
        await workbook.xlsx.readFile(filePath);
    } catch (error) {
        console.log('Arquivo Excel não encontrado. Criando um novo...');
    }

    // Pega a planilha pelo nome ou cria uma nova se não existir
    let worksheet = workbook.getWorksheet(WORKSHEET_NAME);
    if (!worksheet) {
        worksheet = workbook.addWorksheet(WORKSHEET_NAME);
    }

    // Se a planilha for nova (sem linhas), adiciona o cabeçalho
    if (worksheet.rowCount === 0) {
        worksheet.columns = [
            { header: 'Número', key: 'numero', width: 20 },
            { header: 'Nome', key: 'nome', width: 30 },
            { header: 'Email', key: 'email', width: 35 },
        ];
    }

    // Adiciona a nova linha com os dados do usuário
    worksheet.addRow(userData);
    console.log(`Dados adicionados à planilha para o número: ${userData.numero}`);

    // Salva o arquivo
    await workbook.xlsx.writeFile(filePath);
    console.log(`Planilha salva com sucesso em: ${filePath}`);
}