export interface AthletePortfolio {
  id: number;
  registration_id?: number;
  user_id: number;
  sport_category: string;
  achievement_level: 'Kota' | 'Provinsi' | 'Nasional' | 'Internasional';
  club_history?: string;
  certificate_url: string;
  verified_status: 'pending' | 'verified' | 'rejected';
  verified_at?: string;
  created_at: string;
}

export interface AthletePayload {
  registration_id?: number;
  sport_category: string;
  achievement_level: 'Kota' | 'Provinsi' | 'Nasional' | 'Internasional';
  club_history?: string;
  certificate_url: string;
}
