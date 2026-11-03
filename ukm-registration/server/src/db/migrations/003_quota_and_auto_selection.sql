-- Migration 003: Add capacity to UKM and accepted_ukm_id to registrations

ALTER TABLE ukm ADD COLUMN IF NOT EXISTS capacity INT DEFAULT 30;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS accepted_ukm_id INT REFERENCES ukm(id);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS selection_note TEXT;
