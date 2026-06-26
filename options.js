// Carrega as configurações salvas assim que a página abre
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['velocidade', 'corTema'], (result) => {
        if (result.velocidade) document.getElementById('velocidade').value = result.velocidade;
        if (result.corTema) document.getElementById('corTema').value = result.corTema;
    });
});

// Salva as configurações quando o botão é clicado
document.getElementById('btnSalvar').addEventListener('click', () => {
    const vel = document.getElementById('velocidade').value;
    const cor = document.getElementById('corTema').value;

    chrome.storage.sync.set({
        velocidade: vel,
        corTema: cor
    }, () => {
        // Mostra feedback visual
        const status = document.getElementById('status');
        status.textContent = '✅ Configurações salvas com sucesso!';
        setTimeout(() => { status.textContent = ''; }, 3000);
    });
});