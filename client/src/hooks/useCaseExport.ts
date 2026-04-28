import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

/**
 * Hook for exporting case data to Word document
 */
export function useCaseExport() {
  const exportMutation = trpc.farol.exportCaseToWord.useQuery;

  const exportToWord = async (caseId: number) => {
    try {
      const result = await trpc.farol.exportCaseToWord.useQuery({ caseId });
      
      if (!result.data) {
        toast.error('Erro ao exportar caso');
        return;
      }

      // Decode base64 buffer
      const binaryString = atob(result.data.buffer);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create blob and download
      const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Caso exportado: ${result.data.filename}`);
    } catch (error) {
      console.error('Error exporting case:', error);
      toast.error('Erro ao exportar caso');
    }
  };

  return { exportToWord };
}
