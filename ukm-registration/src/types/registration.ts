import type { UKMChoice } from './ukm';

export interface Registration {
  id: number;
  user_id: number;
  result_id?: number;
  ukm_choices: UKMChoice[];
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  reference_number: string;
  submitted_at: string;
  grace_deadline?: string;
  accepted_ukm_id?: number;
  accepted_ukm_name?: string;
  accepted_ukm_category?: string;
  selection_note?: string;
}
