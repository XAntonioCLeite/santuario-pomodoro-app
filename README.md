# O Santuário - Pomodoro Gamificado & Monitoramento de Foco 🪴🧘‍♂️

[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?style=flat&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev/)
[![Capacitor](https://img.shields.io/badge/Capacitor-Mobile-119EFF.svg?style=flat&logo=ionic)](https://capacitorjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI Pipeline](https://github.com/XAntonioCLeite/santuario-pomodoro-app/actions/workflows/ci.yml/badge.svg)](https://github.com/XAntonioCLeite/santuario-pomodoro-app/actions)

> **Aplicação Web & Mobile híbrida de alta performance que transforma sessões de estudo e trabalho focado em um ecossistema botânico virtual com paisagens sonoras sintetizadas em tempo real via Web Audio API.**

---

## 🎯 O Problema & A Solução

- **O Problema**: Temporizadores Pomodoro tradicionais são monotonia pura, sem incentivo contínuo de produtividade nem ambiente acústico relaxante para manter o foco profundo.
- **A Solução**: **O Santuário** une o método Pomodoro a um sistema de cultivo de plantas virtuais evolutivas, mixer de áudio ambiente em tempo real (chuva, ruído branco e acordes de piano gerativos) e integração social com vilarejos e guildas via Firebase.

---

## 🛠️ Tech Stack

| Tecnologia | Função no Projeto |
|---|---|
| ![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black) | Interface reativa e gerenciamento de estado global via Context API |
| **Web Audio API** | Sintetizador procedural em tempo real para ruídos e acordes |
| ![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=flat&logo=ionic&logoColor=white) | Empacotamento nativo híbrido para Android/iOS |
| ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black) | Firestore e Auth para sincronização social e salvamento em nuvem |

---

## ⚡ Quickstart em 30 Segundos

### Pré-requisitos
- Node.js `>= 18.x` ou `>= 20.x`
- Gerenciador de pacotes `npm`

### 1. Clonar o Repositório & Instalar Dependências
```bash
git clone https://github.com/XAntonioCLeite/santuario-pomodoro-app.git
cd santuario-pomodoro-app
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
cp .env.example .env.local
```
Edite o arquivo `.env.local` inserindo suas credenciais do Firebase.

### 3. Rodar em Ambiente de Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:5173` no seu navegador.

---

## 📱 Build Mobile (Android APK)

Para gerar o executável Android via Capacitor:
```bash
npx cap sync
npx cap open android
```
Ou utilize o APK compilado disponível no repositório: [`santuario.apk`](santuario.apk).

---

## 🏗️ Arquitetura & Decisões Técnicas

- **Sintetizador Procedural Web Audio (`audio.js`)**: Em vez de carregar arquivos de áudio estáticos pesados, o sintetizador gera dinamicamente ruído browniano (chuva), filtro de passa-banda e acordes de piano triangulares em tempo real via osciladores, reduzindo o tamanho do bundle.
- **Renderizador Vetorial de Plantas (`plantRenderer.jsx`)**: Algoritmos determinísticos geram sementes vetoriais únicas (SVG/Canvas) para cada espécie cultivada conforme os minutos estudados.

---

## ⚖️ Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).

---

**Autor:** [Antônio Costa Leite](https://github.com/XAntonioCLeite)
