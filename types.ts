export enum Role {
  USER = 'user',
  COORDINATOR = 'coordinator', // The Main AI
  SUB_AGENT = 'sub_agent', // Simulated result from function call
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  attachment?: string; // Base64 image
  agentName?: string; // For SUB_AGENT messages
  toolPayload?: any; // To visualize the data in the dashboard
  groundingUrls?: string[]; // From Google Search
}

export enum AgentType {
  COORDINATOR = 'Hospital System Agent',
  APPOINTMENT = 'Appointment Agent',
  PATIENT = 'Patient Records Agent',
  DOCTOR = 'Doctor Management Agent',
  MEDICAL_INFO = 'Medical Analysis Agent',
}

export interface ChartData {
  name: string;
  value: number;
}