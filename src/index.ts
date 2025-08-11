import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { addUserDataToExcel, UserData } from './excel';

// --- Gerenciamento de Estado de Coleta ---
type CollectionStage = 'awaiting_name' | 'awaiting_email';

interface ChatCollectionState {
    stage: CollectionStage;
    data: Partial<UserData>;
}

const collectionState = new Map<string, ChatCollectionState>();

// --- Constantes de Gatilho ---
const TRIGGER_ASK_NAME = 'Por favor, informe seu nome';
const TRIGGER_ASK_EMAIL = 'Por favor, informe seu email';
const TRIGGER_SAVE = '!excel';

// --- Cliente do WhatsApp ---
console.log('[INFO] Iniciando o cliente do WhatsApp...');
const client = new Client({
    authStrategy: new LocalAuth(),
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('[SUCESSO] Cliente conectado e pronto para ouvir as mensagens.');
});

client.on('message_create', async (message: Message) => {
    const chatId = message.fromMe ? message.to : message.from;
    const messageBody = message.body.trim();

    // --- Lógica de Gatilhos (CONTROLADA PELO OPERADOR) ---
    // Apenas mensagens enviadas por "mim" podem acionar os gatilhos.
    if (message.fromMe) {
        // Gatilho 1: Pedir o NOME
        if (messageBody.includes(TRIGGER_ASK_NAME)) {
            console.log(`[GATILHO DO OPERADOR] Pedido de nome no chat ${chatId}. Aguardando a resposta do cliente.`);
            collectionState.set(chatId, {
                stage: 'awaiting_name',
                data: { numero: chatId.split('@')[0] }
            });
            return;
        }

        // Gatilho 2: Pedir o EMAIL
        if (messageBody.includes(TRIGGER_ASK_EMAIL)) {
            const currentState = collectionState.get(chatId);
            if (currentState && currentState.data.nome) {
                console.log(`[GATILHO DO OPERADOR] Pedido de email no chat ${chatId}. Aguardando a resposta do cliente.`);
                currentState.stage = 'awaiting_email';
                collectionState.set(chatId, currentState);
            }
            return;
        }

        // Gatilho 3: Salvar no Excel
        if (messageBody.toLowerCase() === TRIGGER_SAVE) {
            const currentState = collectionState.get(chatId);
            if (currentState && currentState.data.nome && currentState.data.email) {
                console.log(`[GATILHO DO OPERADOR] Comando !excel recebido para o chat ${chatId}.`);
                try {
                    await addUserDataToExcel(currentState.data as UserData);
                    collectionState.delete(chatId); // Limpa o estado após salvar
                } catch (error) {
                    console.error('[ERRO] Falha ao chamar a função do Excel:', error);
                }
            } else {
                console.log(`[AVISO] Comando !excel do operador ignorado para o chat ${chatId}. Dados do cliente incompletos.`);
            }
            return;
        }
    }

    // --- Lógica de Coleta de Dados (RESPOSTAS DO CLIENTE) ---
    // Se a mensagem NÃO é minha, pode ser uma resposta que eu estava esperando.
    else {
        const currentState = collectionState.get(chatId);
        if (currentState) {
            switch (currentState.stage) {
                case 'awaiting_name':
                    currentState.data.nome = messageBody;
                    console.log(`[DADO COLETADO] Nome "${messageBody}" coletado do chat ${chatId}.`);
                    collectionState.set(chatId, currentState);
                    break;

                case 'awaiting_email':
                    currentState.data.email = messageBody;
                    console.log(`[DADO COLETADO] Email "${messageBody}" coletado do chat ${chatId}.`);
                    collectionState.set(chatId, currentState);
                    break;
            }
        }
    }
});

client.initialize();