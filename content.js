(function() {
    'use strict';

    const ID_HOST = 'aghuse-host-v7';
    const KEY_FILA = 'aghuse_fila_v7';
    const KEY_STATUS = 'aghuse_status_v7';

    // Configurações padrão (caso o usuário nunca tenha entrado no painel)
    let config = {
        velocidade: 1.0,
        corTema: '#d32f2f'
    };

    // 1. CARREGA CONFIGURAÇÕES DO CHROME STORAGE E INICIA
    chrome.storage.sync.get(['velocidade', 'corTema'], (res) => {
        if(res.velocidade) config.velocidade = parseFloat(res.velocidade);
        if(res.corTema) config.corTema = res.corTema;
        
        setInterval(garantirInterface, 1000);
    });

    // 2. FUNÇÃO QUE DESENHA A TELA (SHADOW DOM)
    function garantirInterface() {
        if (!document.getElementById('prontuario:prontuario:inputId')) return;
        if (document.getElementById(ID_HOST)) return;

        // Cria o elemento host que abriga a sombra
        const host = document.createElement('div');
        host.id = ID_HOST;
        document.body.appendChild(host);

        // Cria o Shadow DOM
        const shadow = host.attachShadow({ mode: 'open' });

        // HTML isolado
        shadow.innerHTML = `
            <style>
                .painel {
                    position: fixed; bottom: 20px; right: 20px; z-index: 999999;
                    background: #ffffff; border: 1px solid #ddd; border-radius: 8px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2); width: 300px; padding: 15px;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .header {
                    background: ${config.corTema}; color: white; padding: 8px 10px;
                    margin: -15px -15px 15px -15px; border-radius: 8px 8px 0 0;
                    font-weight: bold; text-align: center;
                }
                textarea {
                    width: 100%; height: 90px; box-sizing: border-box; margin-bottom: 10px;
                    border: 1px solid #ccc; border-radius: 4px; padding: 5px; resize: none;
                    font-family: monospace;
                }
                .botoes { display: flex; gap: 8px; }
                button {
                    flex: 1; padding: 10px; border: none; border-radius: 4px;
                    font-weight: bold; cursor: pointer; color: white; transition: 0.2s;
                }
                #btn_iniciar { background: #28a745; }
                #btn_iniciar:hover { background: #218838; }
                
                /* Estilo do novo botão de Pausar */
                #btn_pausar { background: #ffc107; color: #333; }
                #btn_pausar:hover { background: #e0a800; }

                #btn_parar { background: #6c757d; }
                #btn_parar:hover { background: #5a6268; }
                
                .status-box {
                    margin-top: 12px; font-size: 12px; color: #444;
                    background: #f8f9fa; padding: 8px; border-radius: 4px;
                    border: 1px solid #eee; min-height: 18px; text-align: center;
                }
            </style>
            
            <div class="painel">
                <div class="header">🤖 Robô Impressão v7</div>
                <textarea id="lista_pront" placeholder="Cole a lista de prontuários...\nEx: 123456/7"></textarea>
                <div class="botoes">
                    <button id="btn_iniciar">▶ INICIAR</button>
                    <button id="btn_pausar">⏸ PAUSAR</button>
                    <button id="btn_parar">⏹ PARAR</button>
                </div>
                <div id="status_log" class="status-box">Aguardando fila...</div>
            </div>
        `;

        // Associa os botões dentro do Shadow DOM
        shadow.querySelector('#btn_iniciar').onclick = () => iniciar(shadow);
        shadow.querySelector('#btn_pausar').onclick = () => pausar(shadow);
        shadow.querySelector('#btn_parar').onclick = () => parar(shadow);

        verificarEstadoAutomatico(shadow);
    }

    // 3. LÓGICA DE PROCESSO

    function iniciar(shadow) {
        // Ao iniciar (ou retomar), sempre lê a textarea atualizada
        const txt = shadow.querySelector('#lista_pront').value;
        const lista = txt.split('\n').map(x => x.trim()).filter(x => x);

        if (lista.length === 0) return alert("A lista está vazia!");

        localStorage.setItem(KEY_FILA, JSON.stringify(lista));
        localStorage.setItem(KEY_STATUS, 'rodando');
        
        processarProximo(shadow);
    }

    function pausar(shadow) {
        const status = localStorage.getItem(KEY_STATUS);
        
        if (status === 'rodando') {
            localStorage.setItem(KEY_STATUS, 'pausado');
            msg(shadow, "⏸ PAUSADO. Edite a lista e clique em INICIAR para retomar.");
        } else if (status === 'pausado') {
            // Se o usuário clicar em "Pausar" novamente enquanto já está pausado, podemos retomar
            iniciar(shadow);
        }
    }

    function parar(shadow) {
        localStorage.removeItem(KEY_FILA);
        localStorage.setItem(KEY_STATUS, 'parado');
        msg(shadow, "Processo cancelado.");
        setTimeout(() => location.reload(), 500);
    }

    async function processarProximo(shadow) {
        // Verifica se o robô foi pausado
        const status = localStorage.getItem(KEY_STATUS);
        if (status === 'pausado') {
            msg(shadow, "⏸ PAUSADO. Aguardando retomada...");
            return;
        }

        const filaStr = localStorage.getItem(KEY_FILA);
        if (!filaStr) return;
        
        let fila = JSON.parse(filaStr);
        if (fila.length === 0) {
            msg(shadow, "✅ FIM! Todos impressos.");
            parar(shadow);
            return;
        }

        const atual = fila[0];
        msg(shadow, `⏳ Trabalhando em: <b>${atual}</b>...`);

        try {
            // A. Preencher Prontuário
            const elPront = document.getElementById('prontuario:prontuario:inputId'); 
            if(!elPront) throw "Campo Prontuário não encontrado!";
            
            elPront.focus();
            elPront.value = atual;
            elPront.dispatchEvent(new Event('input', { bubbles: true }));
            elPront.dispatchEvent(new Event('change', { bubbles: true })); 
            elPront.dispatchEvent(new Event('blur', { bubbles: true }));

            // Delay base multiplicado pela configuração do usuário
            await delay(1500 * config.velocidade); 

            // B. Preencher Volume
            const elVol = document.getElementById('volumeImpresso:volumeImpresso:inputId_input');
            const elVolHidden = document.getElementById('volumeImpresso:volumeImpresso:inputId_hinput'); 

            if(elVol) {
                elVol.focus();
                elVol.value = '0';
                elVol.dispatchEvent(new Event('input', { bubbles: true }));
                elVol.dispatchEvent(new Event('keydown', { bubbles: true }));
                elVol.dispatchEvent(new Event('keyup', { bubbles: true }));
                elVol.dispatchEvent(new Event('change', { bubbles: true }));
                elVol.dispatchEvent(new Event('blur', { bubbles: true }));
            }

            if(elVolHidden) elVolHidden.value = '0';

            await delay(500 * config.velocidade);

            // C. Marcar Informado
            const radio = document.getElementById('selecaoImpressao:selecaoImpressao:inputId:2');
            if(radio) {
                radio.checked = true;
                radio.click(); 
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }

            await delay(800 * config.velocidade);

            // D. Atualiza fila
            fila.shift();
            localStorage.setItem(KEY_FILA, JSON.stringify(fila));

            // E. Clicar Imprimir
            const btnImp = document.getElementById('j_idt71:button');
            if(btnImp) {
                msg(shadow, "🖨️ Comando enviado! Recarregando...");
                btnImp.click();
                setTimeout(() => location.reload(), 4000 * config.velocidade);
            } else {
                throw "Botão Imprimir sumiu!";
            }

        } catch (e) {
            msg(shadow, "❌ Erro: " + e);
            console.error(e);
            localStorage.setItem(KEY_STATUS, 'erro');
        }
    }

    function verificarEstadoAutomatico(shadow) {
        const status = localStorage.getItem(KEY_STATUS);
        const fila = JSON.parse(localStorage.getItem(KEY_FILA) || '[]');

        if (status === 'rodando' && fila.length > 0) {
            shadow.querySelector('#lista_pront').value = fila.join('\n');
            msg(shadow, "Continuando em 2s...");
            setTimeout(() => processarProximo(shadow), 2000 * config.velocidade);
        } else if (status === 'pausado') {
            // Popula a textarea com a fila restante e aguarda ação do usuário
            shadow.querySelector('#lista_pront').value = fila.join('\n');
            msg(shadow, "⏸ PAUSADO. Edite a lista e clique em INICIAR para retomar.");
        }
    }

    function msg(shadow, texto) {
        const div = shadow.querySelector('#status_log');
        if(div) div.innerHTML = texto;
    }

    const delay = ms => new Promise(r => setTimeout(r, ms));

})();