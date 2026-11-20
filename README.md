# Dilatar - Olhar Saúde (Triagem Oftalmológica com IA)

## 1. Objetivo e Finalidade
Aplicação PWA orientada à saúde visual, permitindo triagem, registro de dilatação pupilar e análise assistida por inteligência artificial.

## 2. Tecnologias Utilizadas
- React 19, TypeScript, Vite, Tailwind CSS v4, Google Gemini API (@google/genai), Cloudflare Workers, PWA

## 3. Arquitetura e Estrutura de Diretórios
Frontend PWA com React 19 e Vite, estruturado para execução offline e análise visual de imagens via Google Gemini AI SDK. Backend serverless na Cloudflare para endpoints protegidos.

## 4. Principais Arquivos e Responsabilidades
- `index.html`: Shell da aplicação PWA com ícones para mobile.
- `src/App.tsx`: Fluxo de captura, medição e laudo prévio.
- `functions/`: Endpoints serverless Cloudflare.
- `package.json`: Definição de ferramentas e SDK do Gemini.

## 5. Funcionalidades Identificadas
- Interface limpa otimizada para tablets e smartphones
- Capacidades de visão computacional e análise diagnóstica com Gemini AI
- Suporte a instalação como aplicativo independente PWA
- Tratamento seguro de dados oftalmológicos

## 6. Como Compilar ou Executar
```bash
npm install
npm run dev
# Build de produção: npm run build
```

## 7. Estado Atual do Projeto
**Completo**

## 8. Pendências e Limitações Identificadas
Validação clínica dos parâmetros de medição pupilar sob diferentes luminosidades.
