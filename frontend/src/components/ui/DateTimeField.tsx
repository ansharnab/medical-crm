import { TextField, type TextFieldProps } from '@mui/material';

export function toDateTimeLocalValue(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDateTimeLocalValue(value: string) {
  if (!value) return '';
  return new Date(value).toISOString();
}

type DateTimeFieldProps = Omit<TextFieldProps, 'type' | 'value' | 'onChange'> & {
  value?: string | null;
  onChange: (isoValue: string) => void;
};

export function DateTimeField({ value, onChange, ...props }: DateTimeFieldProps) {
  return (
    <TextField
      {...props}
      type="datetime-local"
      value={toDateTimeLocalValue(value)}
      onChange={(e) => onChange(fromDateTimeLocalValue(e.target.value))}
      InputLabelProps={{ shrink: true, ...props.InputLabelProps }}
    />
  );
}
