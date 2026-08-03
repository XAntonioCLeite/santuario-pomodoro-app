# 📖 Relatório Técnico de Desenvolvimento & Manual do Usuário
## 🪴 Santuário Pomodoro: Onde o Foco Floresce

Olá! Este é o manual completo de arquitetura, seções e notas de desenvolvimento do **Santuário Pomodoro**, escrito diretamente pelo desenvolvedor do projeto. Este documento serve para guiar você por cada detalhe da interface, botões, mecânicas lógicas e recursos visuais do nosso web-app de produtividade botânica.

---

## 🧭 Visão Geral do Aplicativo
O **Santuário Pomodoro** é mais do que um simples cronômetro de foco: é uma estufa gamificada que transforma seus minutos de estudo em plantas colecionáveis e relíquias decorativas. O seu tempo concentrado gera moedas virtuais para comprar decorações e evolui suas sementes até árvores frondosas (Santuários), enquanto a distração pode fazê-las murchar.

---

## 🎨 1. Painel Principal (Dashboard & Cronômetro)
O topo da primeira página abriga o controle central da sua jornada de foco.

### ⏱️ O Cronômetro Neumórfico
*   **Três Estados de Foco:**
    *   `Foco` (padrão de 25 minutos) - O ciclo ativo de dedicação.
    *   `Pausa Curta` (padrão de 5 minutos) - Descanso rápido após um bloco.
    *   `Pausa Longa` (padrão de 15 minutos) - Pausa estendida após 4 ciclos de foco.
*   **Controles de Mídia:**
    *   `Play (▶️)`: Inicia a contagem regressiva e altera o sistema de acompanhamento de abas.
    *   `Pause (⏸️)`: Interrompe temporariamente a sessão.
    *   `Pular (⏭️)`: Avança para o próximo ciclo de descanso ou foco.
*   **Seletor de Matéria:** Um menu suspenso onde você escolhe o assunto de estudo ativo. O tempo focado será contabilizado individualmente para este assunto, definindo a cor de classificação da planta na prateleira.

### 📊 Painel de Estatísticas Globais
Localizado ao lado do timer, exibe o progresso acumulado:
*   **Horas Focadas:** Tempo total acumulado convertido em horas amigáveis.
*   **Ofensiva (Streak):** Dias seguidos estudando com o aplicativo.
*   **Nível de Foco:** Progresso geral da conta baseado em minutos totais de foco.

### 🔇 Mixer de Áudio Ambiental
Um painel retrátil de controle de som com sliders independentes para você criar a sua própria atmosfera de estudo:
*   **Controle Master:** Ajusta o volume geral do app.
*   **Chuva:** Ruído natural de tempestade na estufa.
*   **Ruído Branco:** Frequência constante para bloco de ruídos externos.
*   **Piano:** Melodia relaxante de fundo.
*   **Botão Avançar Faixa:** Permite navegar entre músicas ambientais inclusas.

### ⚙️ Interruptores de Foco Rigoroso
*   **Murchar com Distração (Wilt on Distraction):** Se ativado, o aplicativo detecta quando você muda de aba ou minimiza o navegador durante um Pomodoro ativo. Cada distração acumula penalidades nas plantas, podendo levá-las a murchar.
*   **Modo Corporativo:** Ideal para quem estuda/trabalha em ambientes compartilhados. Ao ser ativado, ele substitui o título e o ícone (favicon) da aba do navegador por nomes genéricos de planilhas e relatórios corporativos, disfarçando o uso recreativo do aplicativo.

---

## 🪴 2. A Estufa e Prateleiras (GardenView)
A estufa é o coração visual do santuário, localizada no centro da tela. 

### 🪵 As Prateleiras de Madeira
Os slots da estufa são organizados em prateleiras flutuantes com um vão livre de **110px** de altura, garantindo que as copas das árvores de nível máximo nunca sobreponham a prateleira de cima.

### 🫳 Sistema de Arrastar e Soltar (Drag & Drop)
*   Para reordenar seu jardim, clique e arraste qualquer planta ou relíquia de um slot e solte-o em cima de outro.
*   **Troca de Posição Automática:** Se você soltar um item em um slot que já está ocupado, o aplicativo troca a posição dos dois itens de forma suave e instantânea.
*   **Slot Vazio (`+`):** Ao clicar em um espaço vazio, abre-se o seletor de inventário para colocar plantas obtidas ou decorações compradas no jardim.

### 📐 Customização de Tamanho da Estufa
Um slider no painel de configurações permite que você alterne a quantidade total de slots na sua estufa (`8`, `12`, `16`, `20` ou `24` espaços), adaptando o layout para coleções pequenas ou estufas monumentais.

### 👁️ Nível de Detalhe dos Slots
Para que a sua estufa mostre exatamente o que você quer ver, adicionamos três modos de exibição dos slots:
1.  **Simples:** Exibe apenas o visual do item e a matéria à qual ele pertence.
2.  **Sessão:** Exibe o item, a matéria e a duração da última sessão de foco.
3.  **Completo:** Exibe o item, a matéria, tempo da sessão e detalhes adicionais de integridade da planta (se murchou, nível exato, etc.).

### 📁 Perfis de Organização da Estufa
Você pode salvar diferentes configurações de layouts e alternar entre eles com facilidade:
*   **Perfis Customizados:** Crie layouts personalizados, salve-os com nomes amigáveis (sem emojis no título para maior sobriedade visual) e carregue-os com um clique. O app solicita confirmação antes de apagar qualquer perfil para evitar exclusões acidentais.
*   **Perfis Automáticos Pré-Configurados:** Layouts gerados dinamicamente com base nas suas estatísticas:
    *   *Os melhores:* Agrupa suas plantas de nível mais alto nos slots superiores.
    *   *Matérias (bioma):* Agrupa e ordena as plantas por disciplina de estudo, criando zonas de cores.
    *   *Histórico:* Distribui os itens na ordem cronológica em que foram criados.

---

## 🧪 3. Mecânica Botânica & Níveis de Crescimento
Cada sessão de foco concluída no cronômetro gera uma semente única com base na disciplina estudada.

### 🧬 Os 5 Níveis Evolutivos das Plantas
Desenhamos as plantas para parecerem fofas, elegantes e minimalistas, sem humanizações (sem rostinhos de desenho animado), mantendo a seriedade científica de um santuário natural:
1.  **Nível 1 (Broto):** Uma pequena haste verde saindo da terra com duas folhas arredondadas.
2.  **Nível 2 (Planta Jovem):** Haste estruturada com galhos alternados e folhas maiores.
3.  **Nível 3 (Flor):** Pétalas geométricas sobrepostas com cores contrastantes e miolo dourado.
4.  **Nível 4 (Bonsai):** Tronco robusto e curvo com copas flutuantes de folhagem verdejante.
5.  **Nível 5 (Árvore do Santuário):** Tronco sinuoso de madeira nobre, copa densa com destaques de luz e frutos dourados reluzentes.

*Cada planta repousa sobre um vaso de terracota realista com relevo de borda e sombra projetada elíptica.*

---

## 🏛️ 4. Loja de Relíquias (Shop & Museu)
A loja oferece prêmios de prestígio para quem acumula moedas estudando. Para manter a justiça entre as áreas de estudo, os preços são idênticos em cada categoria de nível, variando apenas para itens raros de nível superior.

### 💰 Economia de Estudo
*   **Moedas de Estudo:** Você ganha **1 Moeda** para cada **1 minuto** focado com sucesso no cronômetro.
*   **Inventário:** As decorações e plantas compradas ficam armazenadas na prateleira do seu inventário de repouso antes de serem posicionadas ativamente na estufa.

### 🛍️ Itens por Área de Conhecimento
*   **Tecnologia & Programação:** Disquete Vintage, Microchip Esmaltado, Tecla Mecânica de Bronze.
*   **Humanas & Sociais:** Martelo de Carvalho Judiciário, Pergaminho Constitucional, Balança da Justiça.
*   **Ciências da Saúde & Biológicas:** Microscópio Vintage, Caduceu de Bronze, Modelo Anatômico de Cristal.
*   **Exatas & Engenharia:** Régua de Cálculo Clássica, Prancheta de Blueprint, Astrolábio de Navegação.
*   **Artes & Expressão:** Metrônomo Antigo, Paleta de Pinturas a Óleo, Busto de Mármore Clássico.

---

## 🧙 5. Onboarding Wizard (Tutorial de Entrada)
Ao entrar no aplicativo pela primeira vez, o usuário é calorosamente recebido por um assistente passo a passo interativo:
*   **Configuração de Perfil:** Escolha do nome, definição de metas diárias em minutos e importação inicial.
*   **Modo Estético Inicial:** Escolha rápida de tema escuro ou claro padrão para guiar o primeiro contato.
*   **Exposição de Mecânicas:** Uma breve explicação animada ilustrando como sementes crescem e como evitar distrações.

---

## 🖼️ 6. Modo Estúdio de Compartilhamento ("Compartilhar Estufa")
Ao clicar em "Compartilhar minha estufa" (antigo botão "Postal"), você abre o menu de exportação social.

*   **Seletor Dinâmico de Temas:** Em vez de botões com texto estático, criamos um carrossel horizontal de círculos com gradientes reais dos temas. Você escolhe a roupagem do postal visualizando o degradê ativo e confirmando com a marcação `✓`.
*   **Renderização em Canvas HD:** O app desenha um postal em alta resolução contendo o visual exato da sua estufa, suas estatísticas de foco e o link oficial de compartilhamento: `https://santuario-pomodoro.vercel.app`.
*   **Atalhos Sociais Rápidos:**
    *   `WhatsApp`: Envia o link de visita formatado diretamente para seus contatos.
    *   `LinkedIn`: Abre o painel para compartilhamento na sua timeline profissional.
    *   `Instagram`: Exibe instruções passo a passo para postar a imagem do postal baixada nos Stories ou Feed.

---

## 👥 7. "A Vila" (Portal Social Contemplativo)
Para separar a produtividade e o foco individual das interações sociais, criamos a quinta aba chamada **"A Vila"**. Ela atua como o único portal de socialização no app, evitando a perda de foco.

### 📇 Cartão de Estudante (Perfil)
*   Permite a customização da identidade visual do usuário (Nickname e escolha de um avatar botânico ou relíquia).
*   Gera um título de prestígio com base nos minutos totais focados (ex: *Jardineiro de Santuários*, *Cultivador de Elite*, *Botânico Lendário*).

### 👥 Lista de Amigos & Status "Estudando Agora"
*   Adição direta de amigos através de seus UIDs.
*   Exibe o status ao vivo dos amigos. Um indicador verde pulsante avisa instantaneamente quem está em uma sessão de foco ativo ("Estudando agora"), incentivando o usuário a iniciar uma sessão também.

### 📖 Livro de Visitas & Reações Silenciosas
*   Na tela de perfil, o usuário lê as mensagens automáticas de quem visitou e admirou sua estufa.
*   **Reações Temáticas:** O visitante pode clicar em reações rápidas da arte do jogo (💧 *Regar*, 🌱 *Broto*, ☀️ *Sol*, ✨ *Admirar*) para interagir sem a necessidade de caixas de texto chatas ou distrações.

### 🌳 Cultivo Co-op & Guildas
*   **Parceria de Duplas:** Possibilidade de cultivar uma planta compartilhada com um amigo selecionado. O progresso de crescimento da planta aumenta com as sessões de foco de ambos os participantes.
*   **Guildas Temáticas:** Escolha de filiação a uma guilda (*Clube da Computação*, *Vestibulandos* ou *Concurseiros*). A guilda possui a **Estufa da Guilda**, exibindo uma floresta virtual que cresce conforme os minutos focados de todos os seus membros.

---

## 🏛️ 8. Modo Visita & O Ateliê de Temas
Ao acessar o link direto de um amigo (`?visit=UID`), o aplicativo entra no **Modo Visita (Modo Museu)**:
*   A interface oculta todos os botões de edição de vasos, a prateleira de inventário e os painéis de controle, tornando a estufa um painel puramente contemplativo.
*   Exibe estatísticas de orgulho do dono: streak (ofensiva), horas de foco acumuladas e matéria favorita.
*   **O Ateliê:** Exibe a prateleira de temas criados pelo usuário visitado. O visitante pode testar o tema temporariamente (Live Preview) ou clicar em **"Copiar Tema"** para adicioná-lo à sua própria coleção, o que gera uma notificação de sucesso e incrementa o contador global de downloads do tema.

---

## 👑 9. Painel Administrativo de Retaguarda (Controle Climático e Eventos)
Acessado pela URL especial `?admin=true` e protegido pela senha master `santuario2026`, permite ao administrador gerenciar o ecossistema:
*   **Rotação de Temporadas:** Ativação manual da temporada do ano (Primavera, Verão, Outono ou Inverno), aplicando automaticamente a paleta de cores.
*   **Eventos Comunitários:** Ativar/desativar e configurar o progresso do evento ativo (título, descrição da meta de horas e barra de progresso coletiva do topo da tela).

---

## 📱 10. Diferenças entre as Versões Web-App e APK (Nativo Android)

| Recurso | 🌐 Web-App (Navegador) | 📱 APK Nativo (Android / Capacitor) |
| :--- | :--- | :--- |
| **Autenticação & Sincronização** | Usa o fluxo OAuth 2.0 padrão da web. O token de acesso é interceptado pelo hash da URL (`window.location.hash`). | Utiliza o plugin `@capgo/capacitor-social-login`. Abre um diálogo nativo seguro (Chrome Custom Tabs) e gerencia credenciais nativas. |
| **Foco Rigoroso (Detecção de Distração)** | Monitorado através do foco da aba do navegador (`document.hidden`, `visibilitychange` e `window.onblur`). Qualquer troca de aba murcha a planta. | Monitorado via listener de estado do app do Capacitor (`App.addListener('appStateChange')`). A penalidade ocorre se o app for minimizado ou o usuário trocar de aplicativo. |
| **Áudio de Ambiente** | Utiliza a API de Áudio HTML5 do navegador. Requer um clique inicial do usuário no site devido às políticas de autofeedback dos navegadores modernos. | Roda no webview do celular. O áudio pode ser pausado pelo sistema operacional caso o app seja mandado para segundo plano e as permissões de bateria estejam em modo otimizado. |
| **Download do Postal** | Cria um link `<a>` temporário invisível com a propriedade `download`, salvando o arquivo PNG diretamente na pasta padrão do sistema operacional. | Converte o Canvas em base64 e pode acionar a API de compartilhamento nativa (Share Sheets) para compartilhar a foto diretamente nos apps do celular. |
| **Instalação e Acesso** | Acessado por URL no navegador. Pode ser adicionado à tela inicial como PWA simplificado. | Instalado como um app nativo `.apk` independente, com ícone próprio e sem barra de URL do navegador. |

---

## 🛠️ 11. Notas de Atualizações (Changelog de Lançamento)

### 🏷️ Versão Atual (Última Atualização)
#### Novidades:
*   **A Vila (Hub Social):** Adicionada a quinta aba de navegação dedicada às interações sociais e comunitárias do Santuário.
*   **Cartão de Perfil & Título de Nível:** Lançada a identidade personalizável com nicknames, avatares botânicos e títulos gerados por horas de foco.
*   **Lista de Amigos com Status Ativo:** Status ao vivo "Estudando agora..." com indicador verde piscando quando um amigo está com foco iniciado.
*   **Livro de Visitas & Reações:** Menu de reações sem texto (Regador, Broto, Sol, Admiração) e registro automático no painel do dono da estufa.
*   **O Ateliê no Modo Museu:** Ao visitar outro perfil, o visitante pode visualizar as prateleiras de temas customizados criados e salvos pelo dono da estufa, testá-los e copiá-los diretamente para a sua biblioteca.
*   **Planta Co-op & Floresta da Guilda:** Lançadas as mecânicas de pareamento para cultivo em dupla e as guildas com a floresta virtual colaborativa que cresce de acordo com os minutos de foco de todos os membros.
*   **Painel Administrativo (`?admin=true`):** Retaguarda protegida por senha master (`santuario2026`) para gerenciar eventos coletivos e rotações climáticas de temporada.
*   **Clean Design:** Todos os menus sociais e indicadores utilizam ícones de traço vetorial SVG premium, sem uso de emojis na interface do usuário.
*   **Compilação Nativa e Build:** Build de produção gerado e APK atualizado compilado com sucesso na raiz do projeto em [santuario.apk](file:///c:/Projetos/Pomodoro/santuario.apk).
