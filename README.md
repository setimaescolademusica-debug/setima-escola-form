# Sétima Escola de Música - Formulário de Intenção de Matrícula

Formulário web ultra sofisticado para captura de intenções de matrícula, substituindo o Google Forms com identidade visual personalizada.

## 🎵 Características

- **Design Minimalista Moderno**: Azul Profundo (#1A1B26) + Laranja Vibrante (#FCA311)
- **Uma Pergunta por Vez**: Fluxo focado e sem distrações
- **Tipografia Montserrat**: Títulos em Itálico (900 Black) para ritmo visual
- **Barra de Progresso**: Indicador visual de progresso em Laranja
- **Validações em Tempo Real**: Feedback imediato para o usuário
- **Lógica Condicional**: Perguntas adaptadas baseadas em respostas anteriores
- **Integração Netlify Forms**: Recebimento de respostas via email

## 📋 Perguntas do Formulário

1. **Seu nome completo** - Texto com validação (mínimo 3 caracteres)
2. **WhatsApp com DDD** - Telefone com formatação automática
3. **Você já possui o instrumento?** - Seleção única (Sim/Não/Não tenho certeza)
4. **Qual é o seu instrumento?** - Seleção com opção "Outros"
   - Canto / Técnica Vocal
   - Piano / Teclado
   - Violão / Guitarra
   - Saxofone
   - Clarineta
   - Violino
   - Outros
5. **Outro instrumento** - Texto (aparece apenas se "Outros" foi selecionado)
6. **Classificação vocal** - Seleção (aparece apenas se "Canto/Técnica Vocal" foi selecionado)
   - Não sei
   - Soprano
   - Mezzo-soprano
   - Contralto
   - Tenor
   - Barítono
   - Baixo
7. **Dias da semana disponíveis** - Múltipla seleção (Segunda a Sexta)
8. **Melhor horário** - Seleção única
   - Manhã (08h às 12h)
   - Tarde (13h às 17h)
   - Noite (18h às 21h)
9. **Observações** - Textarea opcional

## 🚀 Publicação na Netlify

### Opção 1: Deploy Automático (Recomendado)

1. Faça push do repositório para GitHub
2. Acesse [Netlify](https://app.netlify.com)
3. Clique em "New site from Git"
4. Selecione seu repositório
5. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist/public`
6. Clique em "Deploy site"

### Opção 2: Deploy Manual

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Build do projeto
npm run build

# Deploy
netlify deploy --prod --dir=dist/public
```

## 📧 Configuração de Email

O formulário usa **Netlify Forms** para capturar as respostas. Para receber emails:

1. Acesse seu site no Netlify
2. Vá para "Forms" no painel
3. Configure os emails de notificação
4. As respostas aparecerão automaticamente na aba "Forms"

## 🎨 Identidade Visual

### Cores
- **Azul Profundo (Navy)**: `#1A1B26` e `#2B2D42` (backgrounds)
- **Laranja Vibrante (Amber)**: `#FCA311` (CTAs e destaques)
- **Branco**: `#FFFFFF` (textos)

### Tipografia
- **Fonte**: Montserrat
- **Títulos**: 900 Black Italic
- **Corpo**: 500 Medium
- **Botões**: 600 SemiBold

### Elementos
- Borda laranja de 12px à esquerda dos cards
- Barra de progresso em laranja
- Transições suaves (300ms)
- Animações de entrada/saída

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 📱 Responsividade

O formulário é totalmente responsivo e funciona perfeitamente em:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## ✅ Checklist de Publicação

- [ ] Testar todas as perguntas e validações localmente
- [ ] Verificar lógica condicional (Canto/Técnica Vocal e Outros)
- [ ] Testar em mobile
- [ ] Configurar Netlify Forms
- [ ] Testar envio de formulário
- [ ] Configurar email de notificação
- [ ] Publicar na Netlify
- [ ] Testar link publicado
- [ ] Compartilhar link com leads via WhatsApp

## 🔒 Segurança

- Headers de segurança configurados
- Validação de entrada no cliente
- Proteção contra XSS
- Formulário oculto para Netlify Forms

## 📞 Suporte

Para dúvidas sobre o formulário ou a Sétima Escola de Música, entre em contato através do WhatsApp.

---

**Desenvolvido para a Sétima Escola de Música** 🎵
