export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'FREE' | 'PREMIUM';
  image: string;
}

export interface SecurityScanResult {
  vulnerability: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  recommendation: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  tag: string;
  severity: 'CRITICAL' | 'HIGH' | 'INFO';
}

export interface SavedScan {
  id: string;
  timestamp: string;
  input: string;
  result: SecurityScanResult;
}

export interface VaultEntry {
  id: string;
  label: string;
  identifier: string;
  category: string;
  securityScore: number;
  analysis: string;
  createdAt: string;
}