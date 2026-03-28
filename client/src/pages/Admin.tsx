
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { trpc } from '@/lib/trpc';
import { Download, FileText, Table, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Admin() {

  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);
  const [deleteMotivo, setDeleteMotivo] = useState('');

  // Queries
  const { data: respostasData, refetch: refetchRespostas } = trpc.form.obterTodasAsRespostas.useQuery();
  const { data: totalData } = trpc.form.contarRespostas.useQuery();
  const exportCSVMutation = trpc.form.exportarCSV.useQuery(undefined, {
    enabled: false,
  });
  const exportExcelMutation = trpc.form.exportarExcel.useQuery(undefined, {
    enabled: false,
  });
  const deletarRespostaMutation = trpc.form.deletarResposta.useMutation();

  // Funções de exportação
  const handleExportarCSV = async () => {
    try {
      setIsExporting(true);
      const { data } = await exportCSVMutation.refetch();
      if (data) {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(data.csv));
        element.setAttribute('download', data.filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast.success(`Arquivo ${data.filename} baixado com sucesso!`);
      }
    } catch (error) {
      toast.error('Erro ao exportar para CSV');
      console.error(error);
    } finally {
      setIsExporting(false);
      setShowExportDialog(false);
    }
  };

  const handleExportarExcel = async () => {
    try {
      setIsExporting(true);
      const { data } = await exportExcelMutation.refetch();
      if (data) {
        const binaryString = atob(data.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const element = document.createElement('a');
        element.setAttribute('href', url);
        element.setAttribute('download', data.filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        window.URL.revokeObjectURL(url);
        toast.success(`Arquivo ${data.filename} baixado com sucesso!`);
      }
    } catch (error) {
      toast.error('Erro ao exportar para Excel');
      console.error(error);
    } finally {
      setIsExporting(false);
      setShowExportDialog(false);
    }
  };

  // Função para deletar resposta
  const handleDeleteResposta = async () => {
    if (!selectedDeleteId) return;

    try {
      await deletarRespostaMutation.mutateAsync({
        id: selectedDeleteId,
        motivo: deleteMotivo || 'Deletado manualmente',
        deletadoPor: 'Admin'
      });
      
      toast.success('Resposta deletada com sucesso!');
      setSelectedDeleteId(null);
      setDeleteMotivo('');
      refetchRespostas();
    } catch (error) {
      toast.error('Erro ao deletar resposta');
      console.error(error);
    }
  };



  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">🎵 Painel de Administração</h1>
          <p className="text-muted-foreground">Sétima Escola de Música - Gerenciamento de Respostas</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-l-4 border-l-[#FCA311]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Respostas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#FCA311]">{totalData?.total || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#FCA311]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Candidatos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#FCA311]">{respostasData?.length || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#FCA311]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conversão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#FCA311]">100%</div>
            </CardContent>
          </Card>
        </div>

        {/* Ações de Exportação */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Exportar Dados
            </CardTitle>
            <CardDescription>Baixe os dados das respostas em diferentes formatos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => setShowExportDialog(true)}
                className="bg-[#FCA311] hover:bg-[#FCA311]/90 text-[#1A1B26]"
                disabled={isExporting || !respostasData || respostasData.length === 0}
              >
                <FileText className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
              <Button
                onClick={() => setShowExportDialog(true)}
                className="bg-[#FCA311] hover:bg-[#FCA311]/90 text-[#1A1B26]"
                disabled={isExporting || !respostasData || respostasData.length === 0}
              >
                <Table className="w-4 h-4 mr-2" />
                Exportar Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Respostas */}
        <Card>
          <CardHeader>
            <CardTitle>Respostas Recentes</CardTitle>
            <CardDescription>Últimas respostas do formulário de intenção de matrícula - Clique no ícone de lixo para deletar</CardDescription>
          </CardHeader>
          <CardContent>
            {respostasData && respostasData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Nome</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">WhatsApp</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Instrumento</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Horário</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Dias</th>
                      <th className="text-center py-3 px-4 font-semibold text-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {respostasData.slice(0, 10).map((resposta, index) => (
                      <tr key={index} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">{resposta.nomeCompleto}</td>
                        <td className="py-3 px-4">{resposta.whatsapp}</td>
                        <td className="py-3 px-4">{resposta.instrumento}</td>
                        <td className="py-3 px-4">{resposta.melhorHorario}</td>
                        <td className="py-3 px-4">
                          <span className="text-xs bg-[#FCA311]/10 text-[#FCA311] px-2 py-1 rounded">
                            {Array.isArray(resposta.diasDisponiveis) ? resposta.diasDisponiveis.length : 0} dias
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDeleteId(resposta.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Nenhuma resposta ainda</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Exportação */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escolha o Formato de Exportação</DialogTitle>
            <DialogDescription>Selecione o formato desejado para baixar os dados</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleExportarCSV}
              disabled={isExporting}
              className="bg-[#FCA311] hover:bg-[#FCA311]/90 text-[#1A1B26]"
            >
              {isExporting ? 'Exportando...' : 'Baixar como CSV'}
            </Button>
            <Button
              onClick={handleExportarExcel}
              disabled={isExporting}
              className="bg-[#FCA311] hover:bg-[#FCA311]/90 text-[#1A1B26]"
            >
              {isExporting ? 'Exportando...' : 'Baixar como Excel'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog para Confirmação de Deleção */}
      <AlertDialog open={selectedDeleteId !== null} onOpenChange={(open) => {
        if (!open) setSelectedDeleteId(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Resposta?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta resposta? Esta ação não pode ser desfeita, mas os dados serão armazenados no histórico de auditoria.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">Motivo da Deleção (opcional):</label>
            <input
              type="text"
              placeholder="Ex: Teste do sistema, Candidato não real, etc"
              value={deleteMotivo}
              onChange={(e) => setDeleteMotivo(e.target.value)}
              className="w-full mt-2 px-3 py-2 border border-border rounded-md text-sm"
            />
          </div>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteResposta}
              disabled={deletarRespostaMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletarRespostaMutation.isPending ? 'Deletando...' : 'Deletar'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
