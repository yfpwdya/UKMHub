export interface UKM {
  id: number;
  name: string;
  category: string;
  description: string;
  logo_url?: string;
  capacity?: number;
  accepted_count?: number;
  remaining_quota?: number;
}

export interface UKMChoice {
  priority: number;
  ukm: UKM;
}

export const UKM_CATEGORIES = [
  'Semua',
  'Olahraga',
  'Seni',
  'Akademik',
  'Sosial',
  'Keagamaan',
  'Teknologi',
] as const;

export type UKMCategory = (typeof UKM_CATEGORIES)[number];
