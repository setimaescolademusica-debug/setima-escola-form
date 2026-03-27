import React, { useState, useEffect } from 'react';
import { ChevronRight, Music, Check } from 'lucide-react';

interface FormData {
  nomeCompleto: string;
  whatsapp: string;
  possuiInstrumento: string;
  instrumento: string;
  outroInstrumento: string;
  classificacaoVocal: string;
  diasSemana: string[];
  horario: string;
  observacoes: string;
}

interface Pergunta {
  id: string;
  titulo: string;
  tipo: 'texto' | 'telefone' | 'selecao' | 'multipla' | 'textarea';
  opcoes?: string[];
  placeholder?: string;
  validacao?: (valor: any) => boolean;
  mensagemErro?: string;
}

const perguntas: Pergunta[] = [
  {
    id: 'nomeCompleto',
    titulo: 'Qual é o seu nome completo?',
    tipo: 'texto',
    placeholder: 'Digite seu nome completo',
    validacao: (v) => v.trim().length >= 3,
    mensagemErro: 'Por favor, digite um nome válido (mínimo 3 caracteres)',
  },
  {
    id: 'whatsapp',
    titulo: 'Qual é o seu WhatsApp com DDD?',
    tipo: 'telefone',
    placeholder: '(11) 99999-9999',
    validacao: (v) => /^\(\d{2}\)\s?\d{4,5}-\d{4}$/.test(v),
    mensagemErro: 'Por favor, digite um telefone válido (XX) 9XXXX-XXXX',
  },
  {
    id: 'possuiInstrumento',
    titulo: 'Você já possui o instrumento na sua casa?',
    tipo: 'selecao',
    opcoes: ['Sim', 'Não', 'Não tenho certeza'],
  },
  {
    id: 'instrumento',
    titulo: 'Qual é o seu instrumento?',
    tipo: 'selecao',
    opcoes: [
      'Canto / Técnica Vocal',
      'Piano / Teclado',
      'Violão / Guitarra',
      'Saxofone',
      'Clarineta',
      'Violino',
      'Outros',
    ],
  },
  {
    id: 'outroInstrumento',
    titulo: 'Qual é o seu instrumento?',
    tipo: 'texto',
    placeholder: 'Digite o nome do seu instrumento',
    validacao: (v) => v.trim().length >= 2,
    mensagemErro: 'Por favor, digite um instrumento válido',
  },
  {
    id: 'classificacaoVocal',
    titulo: 'Você já sabe qual é a sua classificação vocal?',
    tipo: 'selecao',
    opcoes: [
      'Não sei',
      'Soprano',
      'Mezzo-soprano',
      'Contralto',
      'Tenor',
      'Barítono',
      'Baixo',
    ],
  },
  {
    id: 'diasSemana',
    titulo: 'Quais dias da semana você pode fazer a aula?',
    tipo: 'multipla',
    opcoes: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
  },
  {
    id: 'horario',
    titulo: 'Qual é o melhor horário para as suas aulas?',
    tipo: 'selecao',
    opcoes: [
      'Manhã (08h às 12h)',
      'Tarde (13h às 17h)',
      'Noite (18h às 21h)',
    ],
  },
  {
    id: 'observacoes',
    titulo: 'Você tem alguma dúvida ou informação relevante para nós?',
    tipo: 'textarea',
    placeholder: 'Digite suas observações (opcional)',
  },
];

export default function FormularioMatricula() {
  const [etapaAtual, setEtapaAtual] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    nomeCompleto: '',
    whatsapp: '',
    possuiInstrumento: '',
    instrumento: '',
    outroInstrumento: '',
    classificacaoVocal: '',
    diasSemana: [],
    horario: '',
    observacoes: '',
  });
  const [erros, setErros] = useState<Record<string, string>>({});
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Determinar quais perguntas mostrar baseado nas respostas anteriores
  const perguntasVisiveis = perguntas.filter((p) => {
    if (p.id === 'outroInstrumento') {
      return formData.instrumento === 'Outros';
    }
    if (p.id === 'classificacaoVocal') {
      return formData.instrumento === 'Canto / Técnica Vocal';
    }
    return true;
  });

  const perguntaAtual = perguntasVisiveis[etapaAtual];
  const progresso = ((etapaAtual + 1) / perguntasVisiveis.length) * 100;

  // Formatar telefone
  const formatarTelefone = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    if (apenasNumeros.length <= 2) {
      return `(${apenasNumeros}`;
    }
    if (apenasNumeros.length <= 7) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
    }
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7, 11)}`;
  };

  const handleMudancaValor = (valor: any) => {
    const novoFormData = { ...formData, [perguntaAtual.id]: valor };
    setFormData(novoFormData);
    setErros({ ...erros, [perguntaAtual.id]: '' });
  };

  const handleProxima = () => {
    const valor = formData[perguntaAtual.id as keyof FormData];

    // Validação
    if (perguntaAtual.validacao && !perguntaAtual.validacao(valor)) {
      setErros({ ...erros, [perguntaAtual.id]: perguntaAtual.mensagemErro || 'Campo inválido' });
      return;
    }

    if (
      (perguntaAtual.tipo === 'selecao' || perguntaAtual.tipo === 'telefone' || perguntaAtual.tipo === 'texto') &&
      !valor
    ) {
      setErros({ ...erros, [perguntaAtual.id]: 'Por favor, responda esta pergunta' });
      return;
    }

    if (perguntaAtual.tipo === 'multipla' && (!Array.isArray(valor) || valor.length === 0)) {
      setErros({ ...erros, [perguntaAtual.id]: 'Por favor, selecione pelo menos um dia' });
      return;
    }

    // Ir para próxima pergunta
    if (etapaAtual < perguntasVisiveis.length - 1) {
      setEtapaAtual(etapaAtual + 1);
    } else {
      // Enviar formulário
      enviarFormulario();
    }
  };

  const handleAnterior = () => {
    if (etapaAtual > 0) {
      setEtapaAtual(etapaAtual - 1);
    }
  };

  const enviarFormulario = async () => {
    setCarregando(true);
    try {
      // Preparar dados para envio
      const dadosEnvio = {
        nome: formData.nomeCompleto,
        whatsapp: formData.whatsapp,
        possuiInstrumento: formData.possuiInstrumento,
        instrumento: formData.instrumento === 'Outros' ? formData.outroInstrumento : formData.instrumento,
        classificacaoVocal: formData.classificacaoVocal || 'N/A',
        diasSemana: formData.diasSemana.join(', '),
        horario: formData.horario,
        observacoes: formData.observacoes || 'Nenhuma',
        dataEnvio: new Date().toLocaleString('pt-BR'),
      };

      // Enviar para Netlify Forms (se configurado)
      const formElement = document.getElementById('formulario-setima') as HTMLFormElement;
      if (formElement) {
        const formDataEnvio = new FormData(formElement);
        Object.entries(dadosEnvio).forEach(([key, value]) => {
          formDataEnvio.set(key, String(value));
        });

        await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(formDataEnvio as any).toString(),
        });
      }

      setEnviado(true);
    } catch (erro) {
      console.error('Erro ao enviar formulário:', erro);
      setErros({ ...erros, geral: 'Erro ao enviar formulário. Tente novamente.' });
    } finally {
      setCarregando(false);
    }
  };

  if (enviado) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="setima-card max-w-2xl w-full text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-accent-foreground" />
            </div>
          </div>
          <h1 className="text-3xl mb-4">Obrigado!</h1>
          <p className="text-lg mb-6 text-muted-foreground">
            Sua intenção de matrícula foi registrada com sucesso.
          </p>
          <p className="text-base mb-8">
            Um membro da nossa equipe pedagógica entrará em contato com você em breve para confirmar o dia e horário da sua primeira aula.
          </p>
          <p className="text-sm text-muted-foreground">
            Agradecemos o interesse na Sétima Escola de Música! 🎵
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col p-4">
      {/* Header com Logo */}
      <div className="flex justify-center mb-8 mt-4">
        <div className="flex items-center gap-3">
          <Music className="w-8 h-8 text-accent" />
          <h1 className="text-2xl font-black italic text-accent">Sétima</h1>
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="max-w-2xl w-full mx-auto mb-8">
        <div className="setima-progress-bar">
          <div className="setima-progress-fill" style={{ width: `${progresso}%` }}></div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Pergunta {etapaAtual + 1} de {perguntasVisiveis.length}
        </p>
      </div>

      {/* Card da Pergunta */}
      <div className="flex-1 flex items-center justify-center">
        <div className="setima-card max-w-2xl w-full">
          <h2 className="text-2xl mb-8">{perguntaAtual.titulo}</h2>

          {/* Renderizar campo baseado no tipo */}
          {perguntaAtual.tipo === 'texto' && (
            <input
              type="text"
              placeholder={perguntaAtual.placeholder}
              value={formData[perguntaAtual.id as keyof FormData] as string}
              onChange={(e) => handleMudancaValor(e.target.value)}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={carregando}
            />
          )}

          {perguntaAtual.tipo === 'telefone' && (
            <input
              type="tel"
              placeholder={perguntaAtual.placeholder}
              value={formData[perguntaAtual.id as keyof FormData] as string}
              onChange={(e) => handleMudancaValor(formatarTelefone(e.target.value))}
              maxLength={15}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={carregando}
            />
          )}

          {perguntaAtual.tipo === 'selecao' && (
            <div className="space-y-3">
              {perguntaAtual.opcoes?.map((opcao) => (
                <button
                  key={opcao}
                  onClick={() => handleMudancaValor(opcao)}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left font-medium ${
                    formData[perguntaAtual.id as keyof FormData] === opcao
                      ? 'bg-accent border-accent text-accent-foreground'
                      : 'bg-input border-border text-foreground hover:border-accent'
                  }`}
                  disabled={carregando}
                >
                  {opcao}
                </button>
              ))}
            </div>
          )}

          {perguntaAtual.tipo === 'multipla' && (
            <div className="space-y-3">
              {perguntaAtual.opcoes?.map((opcao) => (
                <button
                  key={opcao}
                  onClick={() => {
                    const diasAtuais = formData.diasSemana;
                    const novosDias = diasAtuais.includes(opcao)
                      ? diasAtuais.filter((d) => d !== opcao)
                      : [...diasAtuais, opcao];
                    handleMudancaValor(novosDias);
                  }}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left font-medium ${
                    formData.diasSemana.includes(opcao)
                      ? 'bg-accent border-accent text-accent-foreground'
                      : 'bg-input border-border text-foreground hover:border-accent'
                  }`}
                  disabled={carregando}
                >
                  {opcao}
                </button>
              ))}
            </div>
          )}

          {perguntaAtual.tipo === 'textarea' && (
            <textarea
              placeholder={perguntaAtual.placeholder}
              value={formData[perguntaAtual.id as keyof FormData] as string}
              onChange={(e) => handleMudancaValor(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              disabled={carregando}
            />
          )}

          {/* Mensagem de Erro */}
          {erros[perguntaAtual.id] && (
            <p className="text-red-500 text-sm mt-3">{erros[perguntaAtual.id]}</p>
          )}

          {erros.geral && <p className="text-red-500 text-sm mt-3">{erros.geral}</p>}

          {/* Botões de Navegação */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleAnterior}
              disabled={etapaAtual === 0 || carregando}
              className="flex-1 px-6 py-3 rounded-lg border-2 border-border text-foreground font-medium transition-all hover:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={handleProxima}
              disabled={carregando}
              className="flex-1 setima-button flex items-center justify-center gap-2"
            >
              {carregando ? 'Enviando...' : etapaAtual === perguntasVisiveis.length - 1 ? 'Finalizar' : 'Próxima'}
              {!carregando && <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Form oculto para Netlify */}
      <form
        id="formulario-setima"
        name="formulario-setima"
        method="POST"
        data-netlify="true"
        style={{ display: 'none' }}
      >
        <input type="hidden" name="form-name" value="formulario-setima" />
        <input type="hidden" name="nome" />
        <input type="hidden" name="whatsapp" />
        <input type="hidden" name="possuiInstrumento" />
        <input type="hidden" name="instrumento" />
        <input type="hidden" name="classificacaoVocal" />
        <input type="hidden" name="diasSemana" />
        <input type="hidden" name="horario" />
        <input type="hidden" name="observacoes" />
        <input type="hidden" name="dataEnvio" />
      </form>
    </div>
  );
}
