import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

const PERGUNTAS = [
  {
    id: 1,
    titulo: 'Qual é o seu nome?',
    tipo: 'texto',
    campo: 'nomeResponsavel',
    placeholder: 'Digite seu nome completo',
    validacao: (valor: string) => valor.length >= 3,
  },
  {
    id: 2,
    titulo: 'Qual é o seu email?',
    tipo: 'email',
    campo: 'emailResponsavel',
    placeholder: 'seu.email@exemplo.com',
    validacao: (valor: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor),
  },
  {
    id: 3,
    titulo: 'Qual é o seu WhatsApp? (com DDD)',
    tipo: 'tel',
    campo: 'whatsapp',
    placeholder: '(11) 99999-9999',
    validacao: (valor: string) => valor.replace(/\D/g, '').length >= 11,
  },
  {
    id: 4,
    titulo: 'Em qual cidade você mora?',
    tipo: 'texto',
    campo: 'cidade',
    placeholder: 'Digite sua cidade',
    validacao: (valor: string) => valor.length >= 2,
  },
  {
    id: 5,
    titulo: 'Qual é o estado (UF)?',
    tipo: 'select',
    campo: 'estado',
    opcoes: ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'],
    validacao: (valor: string) => valor.length === 2,
  },
  {
    id: 6,
    titulo: 'Qual é o nome da criança?',
    tipo: 'texto',
    campo: 'nomeCrianca',
    placeholder: 'Digite o nome da criança',
    validacao: (valor: string) => valor.length >= 2,
  },
  {
    id: 7,
    titulo: 'Qual é a data de nascimento da criança?',
    tipo: 'date',
    campo: 'dataNascimento',
    validacao: (valor: string) => valor.length > 0,
  },
  {
    id: 8,
    titulo: 'Em qual ano escolar a criança está?',
    tipo: 'select',
    campo: 'anoEscolar',
    opcoes: ['Pré-escolar', '1º ano', '2º ano', '3º ano', '4º ano', '5º ano', '6º ano', '7º ano', '8º ano', '9º ano', '1º Ensino Médio', '2º Ensino Médio', '3º Ensino Médio'],
    validacao: (valor: string) => valor.length > 0,
  },
  {
    id: 9,
    titulo: 'Qual é o nível atual de inglês da criança?',
    tipo: 'radio',
    campo: 'nivelIngles',
    opcoes: ['Iniciante (não fala inglês)', 'Básico (algumas palavras)', 'Intermediário (consegue conversar)', 'Avançado (fluente)'],
    validacao: (valor: string) => valor.length > 0,
  },
  {
    id: 10,
    titulo: 'Qual é o objetivo principal? (máximo 2)',
    tipo: 'checkbox',
    campo: 'objetivos',
    opcoes: ['Preparar para exames (TOEFL, Cambridge)', 'Melhorar pronúncia', 'Ganhar confiança para conversar', 'Apoio escolar', 'Diversão e aprendizado'],
    maxSelecoes: 2,
    validacao: (valor: any[]) => Array.isArray(valor) && valor.length > 0 && valor.length <= 2,
  },
  {
    id: 11,
    titulo: 'Quais dias você pode fazer aula? (máximo 3)',
    tipo: 'checkbox',
    campo: 'diasDisponiveis',
    opcoes: ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
    maxSelecoes: 3,
    validacao: (valor: any[]) => Array.isArray(valor) && valor.length > 0 && valor.length <= 3,
  },
  {
    id: 12,
    titulo: 'Qual horário prefere?',
    tipo: 'radio',
    campo: 'horarioPreferido',
    opcoes: ['Manhã (08h-12h)', 'Tarde (13h-17h)', 'Noite (18h-21h)'],
    validacao: (valor: string) => valor.length > 0,
  },
  {
    id: 13,
    titulo: 'Qual metodologia prefere? (máximo 2)',
    tipo: 'checkbox',
    campo: 'metodologiaPreferida',
    opcoes: ['Aulas conversacionais', 'Jogos e atividades lúdicas', 'Filmes e séries', 'Música e canções', 'Estrutura gramatical'],
    maxSelecoes: 2,
    validacao: (valor: any[]) => Array.isArray(valor) && valor.length > 0 && valor.length <= 2,
  },
  {
    id: 14,
    titulo: 'Há algo especial sobre seu filho que devemos saber?',
    tipo: 'textarea',
    campo: 'informacoesAdicionais',
    placeholder: 'Digite aqui (máximo 100 palavras)',
    maxPalavras: 100,
    validacao: () => true,
  },
  {
    id: 15,
    titulo: 'Há alguma restrição ou preferência que não mencionou?',
    tipo: 'textarea',
    campo: 'restricoes',
    placeholder: 'Digite aqui (opcional)',
    validacao: () => true,
  },
];

export default function FormularioMatricula() {
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, any>>({});
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const enviarRespostaMutation = trpc.form.enviarResposta.useMutation({
    onSuccess: () => {
      setEnviado(true);
      toast.success('Matrícula enviada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao enviar matrícula: ' + error.message);
    },
    onSettled: () => {
      setCarregando(false);
    },
  });

  const pergunta = PERGUNTAS[perguntaAtual];
  const resposta = respostas[pergunta.campo];
  const podeAvancar = resposta !== undefined && resposta !== null && pergunta.validacao(resposta);

  const handleProximo = () => {
    if (podeAvancar && perguntaAtual < PERGUNTAS.length - 1) {
      setPerguntaAtual(perguntaAtual + 1);
    }
  };

  const handleAnterior = () => {
    if (perguntaAtual > 0) {
      setPerguntaAtual(perguntaAtual - 1);
    }
  };

  const handleEnviar = async () => {
    setCarregando(true);
    try {
      await enviarRespostaMutation.mutateAsync({
        nomeResponsavel: respostas.nomeResponsavel || '',
        emailResponsavel: respostas.emailResponsavel || '',
        whatsapp: respostas.whatsapp || '',
        cidade: respostas.cidade || '',
        estado: respostas.estado || '',
        nomeCrianca: respostas.nomeCrianca || '',
        dataNascimento: respostas.dataNascimento || '',
        anoEscolar: respostas.anoEscolar || '',
        nivelIngles: respostas.nivelIngles || '',
        objetivos: respostas.objetivos || [],
        diasDisponiveis: respostas.diasDisponiveis || [],
        horarioPreferido: respostas.horarioPreferido || '',
        metodologiaPreferida: respostas.metodologiaPreferida || [],
        informacoesAdicionais: respostas.informacoesAdicionais || '',
        restricoes: respostas.restricoes || '',
      });
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  if (enviado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">✨</div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Sucesso!</h1>
          <p className="text-gray-700 mb-6">
            Sua matrícula foi enviada com sucesso! Um membro da equipe Mooni entrará em contato em breve para confirmar os detalhes da primeira aula.
          </p>
          <p className="text-sm text-gray-600">Obrigado por escolher a Mooni! 🎉</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🌟 Mooni</h1>
          <p className="text-blue-100">A marca da imaginação</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Barra de Progresso */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-600">
                Pergunta {perguntaAtual + 1} de {PERGUNTAS.length}
              </span>
              <span className="text-sm font-semibold text-blue-600">
                {Math.round(((perguntaAtual + 1) / PERGUNTAS.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((perguntaAtual + 1) / PERGUNTAS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Pergunta */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">{pergunta.titulo}</h2>

            {/* Input Texto */}
            {pergunta.tipo === 'texto' && (
              <input
                type="text"
                value={resposta || ''}
                onChange={(e) => setRespostas({ ...respostas, [pergunta.campo]: e.target.value })}
                placeholder={pergunta.placeholder}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 text-lg"
              />
            )}

            {/* Input Email */}
            {pergunta.tipo === 'email' && (
              <input
                type="email"
                value={resposta || ''}
                onChange={(e) => setRespostas({ ...respostas, [pergunta.campo]: e.target.value })}
                placeholder={pergunta.placeholder}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 text-lg"
              />
            )}

            {/* Input Tel */}
            {pergunta.tipo === 'tel' && (
              <input
                type="tel"
                value={resposta || ''}
                onChange={(e) => setRespostas({ ...respostas, [pergunta.campo]: e.target.value })}
                placeholder={pergunta.placeholder}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 text-lg"
              />
            )}

            {/* Input Date */}
            {pergunta.tipo === 'date' && (
              <input
                type="date"
                value={resposta || ''}
                onChange={(e) => setRespostas({ ...respostas, [pergunta.campo]: e.target.value })}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 text-lg"
              />
            )}

            {/* Select */}
            {pergunta.tipo === 'select' && (
              <select
                value={resposta || ''}
                onChange={(e) => setRespostas({ ...respostas, [pergunta.campo]: e.target.value })}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 text-lg"
              >
                <option value="">Selecione uma opção</option>
                {pergunta.opcoes?.map((opcao) => (
                  <option key={opcao} value={opcao}>
                    {opcao}
                  </option>
                ))}
              </select>
            )}

            {/* Radio */}
            {pergunta.tipo === 'radio' && (
              <div className="space-y-3">
                {pergunta.opcoes?.map((opcao) => (
                  <label key={opcao} className="flex items-center p-3 border-2 border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                    <input
                      type="radio"
                      name={pergunta.campo}
                      value={opcao}
                      checked={resposta === opcao}
                      onChange={(e) => setRespostas({ ...respostas, [pergunta.campo]: e.target.value })}
                      className="w-4 h-4 text-blue-500"
                    />
                    <span className="ml-3 text-gray-700">{opcao}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Checkbox */}
            {pergunta.tipo === 'checkbox' && (
              <div className="space-y-3">
                {pergunta.opcoes?.map((opcao) => (
                  <label key={opcao} className="flex items-center p-3 border-2 border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                    <input
                      type="checkbox"
                      checked={resposta && Array.isArray(resposta) && resposta.includes(opcao)}
                      onChange={(e) => {
                        const novasRespostas = Array.isArray(resposta) ? [...resposta] : [];
                        if (e.target.checked) {
                          if (novasRespostas.length < (pergunta.maxSelecoes || 999)) {
                            novasRespostas.push(opcao);
                          }
                        } else {
                          const index = novasRespostas.indexOf(opcao);
                          if (index > -1) {
                            novasRespostas.splice(index, 1);
                          }
                        }
                        setRespostas({ ...respostas, [pergunta.campo]: novasRespostas });
                      }}
                      className="w-4 h-4 text-blue-500"
                    />
                    <span className="ml-3 text-gray-700">{opcao}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Textarea */}
            {pergunta.tipo === 'textarea' && (
              <textarea
                value={resposta || ''}
                onChange={(e) => {
                  const valor = e.target.value;
                  const palavras = valor.trim().split(/\s+/).length;
                  if (pergunta.maxPalavras === undefined || palavras <= pergunta.maxPalavras) {
                    setRespostas({ ...respostas, [pergunta.campo]: valor });
                  }
                }}
                placeholder={pergunta.placeholder}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 text-lg resize-none"
                rows={4}
              />
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <button
              onClick={handleAnterior}
              disabled={perguntaAtual === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={20} />
              Anterior
            </button>

            {perguntaAtual === PERGUNTAS.length - 1 ? (
              <button
                onClick={handleEnviar}
                disabled={!podeAvancar || carregando}
                className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {carregando ? 'Enviando...' : 'Finalizar'}
              </button>
            ) : (
              <button
                onClick={handleProximo}
                disabled={!podeAvancar}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Próximo
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
