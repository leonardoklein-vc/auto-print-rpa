# 🤖 AGHUse Auto-Print (RPA Extension)

![Chrome Extension](https://img.shields.io/badge/Chrome_Extension-v3-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![RPA](https://img.shields.io/badge/Micro--RPA-Shadow_DOM-10a37f?style=for-the-badge)

Uma extensão de navegador customizada atuando como um Robô de Automação de Processos (RPA). Desenvolvida para otimizar a rotina de impressão em lote de etiquetas de pacientes no sistema AGHUse do Hospital de Clínicas de Porto Alegre (HCPA).

<div align="center">
  <img width="128" height="128" alt="icon128" src="https://github.com/user-attachments/assets/2577cb7b-8aa6-4839-b7da-4f88224baee2" />
</div>

---

## 🚨 O Contexto e o Problema

A impressão de dezenas (ou centenas) de etiquetas diárias exigia que um funcionário ficasse refém do sistema: digitando o número do prontuário, preenchendo o volume, clicando em imprimir e aguardando o recarregamento da página para repetir o processo.
* **O Gargalo:** A TI institucional possui um roadmap estratégico longo e não podia priorizar a automação de um fluxo específico deste setor em curto prazo.
* **O Custo:** Horas de trabalho humano altamente repetitivo, propenso a erros de digitação e causador de fadiga ocupacional.

---

## 💡 A Solução: Micro-RPA no Navegador

Desenvolvi uma extensão para o Google Chrome (Manifest V3) que assume o controle do DOM e executa os passos repetitivos automaticamente. O usuário apenas cola uma lista de prontuários, aperta "Iniciar" e o robô faz o resto.
<img width="403" height="343" alt="etiq1" src="https://github.com/user-attachments/assets/01a217de-300a-445f-ac2a-14b039996d1b" />


### ✨ Destaques de Engenharia e UX

#### 1. Persistência de Estado (Reload-Proof)
O sistema AGHUse recarrega a página inteira a cada comando de impressão enviado. Para o robô não "morrer", implementei um controle de fila utilizando o `localStorage`. O script salva a lista pendente e o status (`rodando` ou `pausado`), injetando-se novamente e retomando o trabalho sozinho assim que a página termina o reload.

#### 2. Isolamento Visual (Shadow DOM)
Para evitar que o CSS da extensão quebrasse o layout legado do sistema hospitalar (ou vice-versa), toda a interface do robô é renderizada dentro de uma **Shadow Tree** isolada (`attachShadow({ mode: 'open' })`).

#### 3. Controle de Throttling Configurável
Como os computadores dos setores variam em capacidade de processamento, a extensão possui uma página de "Opções" (`options.html`) onde o usuário pode calibrar o *delay* (Velocidade de Execução). Isso evita que o robô envie comandos mais rápido do que o servidor consegue processar.

#### 4. Deployment Zero-Friction (Script .bat)
Para contornar a dificuldade técnica dos usuários em instalar extensões não publicadas na loja do Google, criei um script de lote (`instalar_robo.bat`). Ele cria automaticamente os diretórios locais de forma segura e abre o painel de desenvolvedor do Chrome com instruções simples na tela.

---

## ⚙️ Funcionalidades Embutidas
* **Fila Dinâmica:** Aceita colagem de listas (Ex: `123456/7`) e processa sequencialmente.
* **Controle de Pausa:** Permite interromper o processo para uma impressão de urgência manual e retomar depois de onde parou.
* **Temas Customizáveis:** Modo escuro e cores institucionais configuráveis para conforto visual.
