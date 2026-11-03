export interface Schedule {
  id: number;
  ukm_id: number;
  ukm_name?: string;
  ukm_category?: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  quota: number;
  booked_count?: string | number;
  type: 'kegiatan' | 'wawancara' | 'audisi' | 'latihan';
  created_at?: string;
}

export interface InterviewBooking {
  id: number;
  registration_id: number;
  user_id: number;
  schedule_id: number;
  booked_at: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  ukm_name: string;
}
