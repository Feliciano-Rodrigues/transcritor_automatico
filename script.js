const caixaTextoTranscrito = document.getElementById('texto-transcrito');
const caixaTextoTraduzido = document.getElementById('texto-traduzido');
const botaoTranscricao = document.getElementById('transcrever');
const botaoVoltar = document.getElementById('voltar');

const API_KEY = 'SUA_CHAVE_DE_API'; // Substitua com sua chave de API do Google Translate

if ('webkitSpeechRecognition' in window) {
    const reconhecimento = new webkitSpeechRecognition();
    reconhecimento.lang = 'pt-BR'; // Defina a língua base do reconhecimento
    reconhecimento.interimResults = false;

    reconhecimento.onresult = async (evento) => {
        let transcricao = evento.results[0][0].transcript;
        transcricao = corrigirOrtografiaEacentuacao(transcricao);
        caixaTextoTranscrito.value = transcricao;
        
        try {
            const textoTraduzido = await traduzirTexto(transcricao);
            caixaTextoTraduzido.value = textoTraduzido;
        } catch (error) {
            console.error('Erro ao traduzir texto: ', error);
            caixaTextoTraduzido.value = 'Erro ao traduzir texto.';
        }
    };

    reconhecimento.onerror = (evento) => {
        console.error('Erro no reconhecimento de fala: ', evento.error);
        if (evento.error === 'no-speech') {
            alert('Nenhuma fala detectada. Por favor, tente novamente.');
        }
        botaoTranscricao.disabled = false;
    };

    reconhecimento.onend = () => {
        botaoTranscricao.disabled = false;
    };

    botaoTranscricao.addEventListener('click', () => {
        caixaTextoTranscrito.value = '';
        caixaTextoTraduzido.value = '';
        reconhecimento.start();
        botaoTranscricao.disabled = true;
    });

    botaoVoltar.addEventListener('click', () => {
        caixaTextoTraduzido.value = '';
        caixaTextoTranscrito.value = '';
    });
} else {
    alert('Seu navegador não suporta a API de reconhecimento de fala. Por favor, use o Google Chrome ou outro navegador compatível.');
    botaoTranscricao.disabled = true;
}

// Função para corrigir ortografia e acentuação básica
function corrigirOrtografiaEacentuacao(texto) {
    const correcoes = {
        'a ': 'à ',
        'e ': 'é ',
        'i ': 'í ',
        'o ': 'ó ',
        'u ': 'ú ',
        'c ': 'ç ',
        'nao': 'não',
        'para ': 'pra ',
        ' voce': ' você',
        ' ele': ' ele',
        'ela': ' ela',
        'ela ': ' ela',
        'delas': ' delas',
        'deles': ' deles'
    };

    for (let [erro, correcao] of Object.entries(correcoes)) {
        let regex = new RegExp(erro, 'gi');
        texto = texto.replace(regex, correcao);
    }

    return texto;
}

// Função para traduzir texto usando a API do Google Translate
async function traduzirTexto(texto) {
    try {
        const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: texto,
                target: 'pt',
                format: 'text'
            })
        });

        if (!response.ok) {
            throw new Error('Erro na resposta da API: ' + response.statusText);
        }

        const data = await response.json();
        if (!data.data || !data.data.translations || !data.data.translations[0].translatedText) {
            throw new Error('Texto traduzido não encontrado na resposta.');
        }

        return data.data.translations[0].translatedText;
    } catch (error) {
        console.error('Erro na tradução: ', error);
        return 'Erro ao traduzir texto.';
    }
}
