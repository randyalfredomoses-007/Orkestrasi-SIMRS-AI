import { FunctionDeclaration, SchemaType, Type } from "@google/genai";

export const MODEL_NAME = 'gemini-2.5-flash'; 

export const SYSTEM_INSTRUCTION = `
Anda adalah Koordinator Pusat (Hospital System Agent) yang sangat ahli di bidang Orkestrasi Digital Agen Manajemen Rumah Sakit. Misi utama Anda adalah menganalisis setiap permintaan pengguna untuk menentukan maksudnya secara akurat dan MENGARAHKANNYA ke SATU sub-agen spesialis menggunakan mekanisme Function Calling.

PERINTAH UTAMA:
1. DELEGASI WAJIB: Anda DILARANG KERAS untuk mencoba menjawab pertanyaan pengguna secara langsung. Anda HANYA BOLEH menghasilkan Function Call.
2. INTEGRITAS DATA: Segala informasi sensitif (PHI) harus diasumsikan mengikuti standar kepatuhan HIPAA/GDPR.
3. FALLBACK: Jika maksud pengguna tidak jelas (ambigu), gunakan alat Google Search untuk klarifikasi konteks sebelum memilih fungsi delegasi.
4. OUTPUT: Pastikan Function Call menyertakan kueri asli pengguna dan semua parameter yang diperlukan.
5. MULTIMODAL: Jika pengguna memberikan gambar (misal: X-Ray, lesi kulit), Anda WAJIB memanggil 'analyze_medical_query' dan meneruskan deskripsi konteksnya.

SUB-AGEN (Fungsi):
- schedule_appointment: Untuk booking, reschedule, batal janji.
- manage_patient_records: Untuk update data pasien, riwayat medis, adminstrasi.
- manage_doctor_data: Untuk jadwal dokter, spesialisasi, ketersediaan.
- analyze_medical_query: Untuk pertanyaan medis umum, diagnosis, dan ANALISIS GAMBAR.
`;

// Function Definitions
export const TOOLS: FunctionDeclaration[] = [
  {
    name: 'schedule_appointment',
    description: 'Mengelola pemesanan, penjadwalan ulang, pembatalan janji temu, dan konfirmasi.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        action_type: { type: Type.STRING, description: 'book, reschedule, cancel' },
        specialty: { type: Type.STRING, description: 'e.g., Cardiologist, Dermatologist' },
        date_time: { type: Type.STRING, description: 'Requested date and time' },
        reason: { type: Type.STRING, description: 'Reason for appointment' }
      },
      required: ['action_type']
    }
  },
  {
    name: 'manage_patient_records',
    description: 'Mendaftarkan pasien, memperbarui data, dan mengambil ringkasan rekam medis.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        task_type: { type: Type.STRING, description: 'register, update, retrieve' },
        patient_name: { type: Type.STRING },
        details: { type: Type.STRING, description: 'Details to update or retrieve' }
      },
      required: ['task_type']
    }
  },
  {
    name: 'manage_doctor_data',
    description: 'Mengelola jadwal, spesialisasi, dan ketersediaan dokter.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query_type: { type: Type.STRING, description: 'schedule, availability, info' },
        doctor_name: { type: Type.STRING, description: 'Optional specific doctor name' }
      },
      required: ['query_type']
    }
  },
  {
    name: 'analyze_medical_query',
    description: 'Menyediakan informasi medis umum, diagnosis, dan MENGANILISIS GAMBAR MEDIS (multimodal).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query_text: { type: Type.STRING, description: 'The user medical question or observation' },
        has_image: { type: Type.BOOLEAN, description: 'Set to true if user uploaded an image' }
      },
      required: ['query_text']
    }
  }
];