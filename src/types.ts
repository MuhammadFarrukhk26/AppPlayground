export interface PriceBreakdown {
  base: number;
  work: number;
  tax: number;
  total: number;
}

export interface ProviderInfo {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  rating: number;
  trips: number;
  specialty: string;
}

export interface BookingState {
  id: string;
  service: string;
  serviceKey: string;
  subService: string;
  address: string;
  slot: string;
  description: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  price: PriceBreakdown;
  provider: ProviderInfo | null;
  createdAt: string;
}

export interface JobInvite {
  id: string;
  service: string;
  subService: string;
  address: string;
  slot: string;
  description: string;
  price: PriceBreakdown;
  customerName: string;
  customerPhone: string;
  distance: string;
}

export interface ActionLog {
  id: string;
  time: string;
  message: string;
  type: 'customer' | 'worker' | 'system';
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'worker';
  text: string;
  timestamp: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'worker';
  specialty?: string;
  isLoggedIn: boolean;
}

export interface CodeFile {
  name: string;
  path: string;
  language: string;
  content: string;
  explanation: string;
}
