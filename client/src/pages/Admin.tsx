import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { trpc } from '@/lib/trpc';
import { Download, FileText, Table, Trash2, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

// Mapeamento de cores para status
const statusConfig = {
  novo: { label: 'Novo', color: 'bg-gray-200 text-gray-900 font-semibold', bgColor: 'bg-gray-100 hover:bg-gray-200' },
  msg_enviada: { label: 'Msg enviada', color: 'bg-yellow-300 text-yellow-900 font-semibold', bgColor: 'bg-yellow-200 hover:bg-yellow-300' },
  aula_marcada: { label: 'Aula Marcada', color: 'bg-blue-300 text-blue-900 font-semibold', bgColor: 'bg-blue-200 hover:bg-blue-300' },
  matriculado: { label: 'Matriculado', color: 'bg-green-300 text-green-900 font-semibold', bgColor: 'bg-green-200 hover:bg-green-300' },
};

export default function Admin() {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);
  const [deleteMotivo, setDeleteMotivo] = useState('');
  const [openStatusMenuId, setOpenStatusMenuId] = useState<number | null>(null);

  // Queries
  const { data: respostasData, refetch: refetchRespostas } = trpc.form.obterTodasAsRespostas.useQuery();
  const { data: totalData } = trpc.form.contarRespostas.useQuery();
  const exportCSVMutation = trpc.form.exportarCSV.useQuery(undefined, {
    enabled: false,
  });
  const exportExcelMutation = trpc.form.exportarExcel.useQuery(undefined, {
    enabled: false,
  });

  // Mutations
  const atualizarStatusMutation = trpc.form.atualizarStatus.useMutation({
    onSuccess: () => {
      refetchRespostas();
      setOpenStatusMenuId(null);
      toast.success('Status atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar status');
    },
  });

  const deletarRespostaMutation = trpc.form.deletarResposta.useMutation({
    onSuccess: () => {
      refetchRespostas();
      setSelectedDeleteId(null);
      setDeleteMotivo('');
      toast.success('Resposta deletada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao deletar resposta');
    },
  });

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const result = await exportCSVMutation.refetch();
      if (result.data) {
        const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `mooni-matriculas-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('CSV exportado com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao exportar CSV');
    } finally {
      setIsExporting(false);
      setShowExportDialog(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const result = await exportExcelMutation.refetch();
      if (result.data) {
        const blob = new Blob([result.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `mooni-matriculas-${new Date().toISOString().split('T')[0]}.xlsx`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Excel exportado com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao exportar Excel');
    } finally {
      setIsExporting(false);
      setShowExportDialog(false);
    }
  };

  const respostas = respostasData || [];
  const total = totalData || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Painel Mooni</h1>
          <p className="text-blue-700">Gerenciar matrículas de aulas de inglês</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Total de Matrículas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{total}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Novo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{respostas.filter(r => r.status === 'novo').length}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Msg Enviada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-900">{respostas.filter(r => r.status === 'msg_enviada').length}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Matriculado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{respostas.filter(r => r.status === 'matriculado').length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setShowExportDialog(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            <Download size={20} />
            Exportar
          </button>
        </div>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Exportar Dados</DialogTitle>
              <DialogDescription>Escolha o formato para exportar as matrículas</DialogDescription>
            </DialogHeader>
            <div className="flex gap-3">
              <button
                onClick={handleExportCSV}
                disabled={isExporting}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
              >
                <FileText size={20} />
                CSV
              </button>
              <button
                onClick={handleExportExcel}
                disabled={isExporting}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
              >
                <Table size={20} />
                Excel
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Table */}
        <Card className="bg-white border-blue-200">
          <CardHeader>
            <CardTitle>Últimas Matrículas</CardTitle>
            <CardDescription>Respostas do formulário de matrícula</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blue-200 bg-blue-50">
                    <th className="py-3 px-4 text-left font-semibold text-blue-900">Responsável</th>
                    <th className="py-3 px-4 text-left font-semibold text-blue-900">Criança</th>
                    <th className="py-3 px-4 text-left font-semibold text-blue-900">Email</th>
                    <th className="py-3 px-4 text-left font-semibold text-blue-900">WhatsApp</th>
                    <th className="py-3 px-4 text-left font-semibold text-blue-900">Nível</th>
                    <th className="py-3 px-4 text-left font-semibold text-blue-900">Status</th>
                    <th className="py-3 px-4 text-left font-semibold text-blue-900">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {respostas.map((resposta, index) => (
                    <tr key={index} className="border-b border-blue-100 hover:bg-blue-50">
                      <td className="py-3 px-4 text-gray-900 font-medium">{resposta.nomeResponsavel}</td>
                      <td className="py-3 px-4 text-gray-900 font-medium">{resposta.nomeCrianca}</td>
                      <td className="py-3 px-4 text-xs text-gray-900 font-medium">{resposta.emailResponsavel}</td>
                      <td className="py-3 px-4 text-gray-900 font-medium">{resposta.whatsapp}</td>
                      <td className="py-3 px-4 text-xs text-gray-900 font-medium">{resposta.nivelIngles}</td>
                      <td className="py-3 px-4">
                        <div className="relative">
                          <button
                            onClick={() => setOpenStatusMenuId(openStatusMenuId === resposta.id ? null : resposta.id)}
                            className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 ${statusConfig[resposta.status as keyof typeof statusConfig]?.color || statusConfig.novo.color}`}
                          >
                            {statusConfig[resposta.status as keyof typeof statusConfig]?.label || 'Novo'}
                            <ChevronDown size={14} />
                          </button>
                          {openStatusMenuId === resposta.id && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-blue-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                              {Object.entries(statusConfig).map(([key, config]) => (
                                <button
                                  key={key}
                                  onClick={() => {
                                    atualizarStatusMutation.mutate({
                                      id: resposta.id,
                                      status: key as any,
                                    });
                                  }}
                                  className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${config.bgColor}`}
                                >
                                  {config.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedDeleteId(resposta.id)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Delete Dialog */}
        <AlertDialog open={selectedDeleteId !== null} onOpenChange={(open) => !open && setSelectedDeleteId(null)}>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Deletar Matrícula</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja deletar esta matrícula? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Motivo (opcional)</label>
              <textarea
                value={deleteMotivo}
                onChange={(e) => setDeleteMotivo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Por que está deletando?"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <AlertDialogCancel className="flex-1">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (selectedDeleteId) {
                    deletarRespostaMutation.mutate({
                      id: selectedDeleteId,
                      motivo: deleteMotivo,
                    });
                  }
                }}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                Deletar
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
