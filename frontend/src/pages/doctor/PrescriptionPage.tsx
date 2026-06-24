import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPrescription, savePrescription } from '@/api/modules';
import { CrmHint, CrmListLoading, CrmPanel, FigmaScreen } from '@/components/app';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/utils/apiError';
import type { PrescriptionItem } from '@/types/clinical';

export function PrescriptionPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<PrescriptionItem[]>([
    { medicineName: '', dose: '', duration: '', quantity: 0 },
  ]);

  const { data: rx, isLoading } = useQuery({
    queryKey: ['prescription', appointmentId],
    queryFn: () => fetchPrescription(appointmentId!),
    enabled: Boolean(appointmentId),
  });

  useEffect(() => {
    if (rx) {
      setNotes(rx.notes || '');
      setLines(rx.items.length ? rx.items : [{ medicineName: '', dose: '', duration: '', quantity: 0 }]);
    }
  }, [rx]);

  const saveMutation = useMutation({
    mutationFn: () =>
      savePrescription(appointmentId!, {
        notes,
        items: lines.filter((l) => l.medicineName.trim()),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescription', appointmentId] });
      showToast('Prescription saved.');
    },
    onError: (e) => showToast(getApiErrorMessage(e, 'Save failed.'), 'error'),
  });

  const addLine = () => setLines((prev) => [...prev, { medicineName: '', dose: '', duration: '', quantity: 0 }]);
  const updateLine = (idx: number, field: keyof PrescriptionItem, value: string | number) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
  };
  const removeLine = (idx: number) => setLines((prev) => prev.filter((_, i) => i !== idx));

  if (isLoading) return <FigmaScreen><CrmPanel title="Loading…"><CrmListLoading /></CrmPanel></FigmaScreen>;

  return (
    <FigmaScreen>
      <CrmHint>E-prescription · digital Rx builder</CrmHint>
      <CrmPanel title={`Prescription — Consultation ${appointmentId?.slice(0, 8) ?? ''}`}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <button type="button" className="crm-btn crm-btn-secondary" onClick={() => navigate(-1)}>Back</button>
          <button type="button" className="crm-btn crm-btn-primary" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>Save Rx</button>
          <button type="button" className="crm-btn crm-btn-secondary" onClick={() => window.print()}>Print</button>
        </div>
        <textarea className="crm-input" style={{ width: '100%', minHeight: 60, marginBottom: 16 }} placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <table className="crm-table">
          <thead>
            <tr><th>Medicine</th><th>Dose</th><th>Duration</th><th>Qty</th><th /></tr>
          </thead>
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx}>
                <td><input className="crm-input" value={line.medicineName} onChange={(e) => updateLine(idx, 'medicineName', e.target.value)} /></td>
                <td><input className="crm-input" value={line.dose || ''} onChange={(e) => updateLine(idx, 'dose', e.target.value)} /></td>
                <td><input className="crm-input" value={line.duration || ''} onChange={(e) => updateLine(idx, 'duration', e.target.value)} /></td>
                <td><input className="crm-input" type="number" value={line.quantity || 0} onChange={(e) => updateLine(idx, 'quantity', Number(e.target.value))} style={{ width: 70 }} /></td>
                <td><button type="button" className="crm-btn crm-btn-secondary" onClick={() => removeLine(idx)}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" className="crm-btn crm-btn-secondary" style={{ marginTop: 12 }} onClick={addLine}>+ Add medicine</button>
      </CrmPanel>
    </FigmaScreen>
  );
}
