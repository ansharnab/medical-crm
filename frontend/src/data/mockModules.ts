/** Mock data for NEW module UIs until backend APIs ship */

export const mockInvoices = [
  { id: 'INV-1042', patient: 'Rajesh Kumar', amount: 500, gst: 90, status: 'paid' as const, date: '2026-06-08' },
  { id: 'INV-1043', patient: 'Priya Shah', amount: 750, gst: 135, status: 'partial' as const, date: '2026-06-07' },
  { id: 'INV-1044', patient: 'Amit Verma', amount: 500, gst: 90, status: 'pending' as const, date: '2026-06-08' },
];

export const mockPharmacyStock = [
  { id: 1, name: 'Amlodipine 5mg', qty: 120, min: 20, category: 'Tablets' },
  { id: 2, name: 'Paracetamol 500mg', qty: 8, min: 25, category: 'Tablets' },
  { id: 3, name: 'Atorvastatin 10mg', qty: 0, min: 15, category: 'Tablets' },
  { id: 4, name: 'Cough Syrup', qty: 45, min: 10, category: 'Syrups' },
];

export const mockMessages = [
  { id: 1, channel: 'WhatsApp', to: 'Rajesh Kumar', template: 'Appointment reminder', status: 'delivered', at: '10:02 AM' },
  { id: 2, channel: 'SMS', to: 'Priya Shah', template: 'Follow-up in 7 days', status: 'sent', at: '09:45 AM' },
  { id: 3, channel: 'Email', to: 'amit@email.com', template: 'Invoice INV-1044', status: 'queued', at: '09:30 AM' },
];

export const mockAuditLog = [
  { id: 1, user: 'reception@democlinic.com', action: 'Created patient', detail: 'Rajesh Kumar', at: '2026-06-08 10:15' },
  { id: 2, user: 'doctor@democlinic.com', action: 'Completed consultation', detail: 'Token #5', at: '2026-06-08 11:02' },
  { id: 3, user: 'admin@democlinic.com', action: 'Updated doctor fees', detail: 'Dr. Patel → ₹500', at: '2026-06-07 16:40' },
];

export const mockLabOrders = [
  { id: 'LAB-201', test: 'CBC', patient: 'Rajesh Kumar', status: 'pending' as const },
  { id: 'LAB-202', test: 'Lipid Profile', patient: 'Priya Shah', status: 'completed' as const },
];

export const mockSubscriptionPlans = [
  { id: 'starter', name: 'Starter', price: '₹2,999/mo', clinics: 1, users: 5, features: ['Patients', 'Appointments', 'Queue'] },
  { id: 'pro', name: 'Pro', price: '₹7,999/mo', clinics: 3, users: 20, features: ['All Starter', 'Billing', 'Analytics', 'SMS'] },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', clinics: 'Unlimited', users: 'Unlimited', features: ['All Pro', 'Pharmacy', 'Portal', 'API access'] },
];

export const mockPrescriptionLines = [
  { id: 1, name: 'Amlodipine 5mg', dose: '1 tab OD', duration: '30 days', qty: 30 },
  { id: 2, name: 'Paracetamol 500mg', dose: 'SOS', duration: '5 days', qty: 10 },
];
