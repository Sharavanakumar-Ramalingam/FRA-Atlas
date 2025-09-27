-- Initialize FRA Atlas 360 Database
-- This script sets up the initial database with PostGIS extension

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Create indexes for better performance
-- These will be created automatically by SQLAlchemy, but we can add custom ones here

-- Index for spatial queries
-- CREATE INDEX IF NOT EXISTS idx_parcels_geometry ON parcels USING GIST (geometry);

-- Index for location-based queries  
-- CREATE INDEX IF NOT EXISTS idx_claims_location ON claims (state, district, village);
-- CREATE INDEX IF NOT EXISTS idx_parcels_location ON parcels (state, district, village);

-- Create full-text search indexes for document content
-- CREATE INDEX IF NOT EXISTS idx_documents_text_search ON documents USING GIN (to_tsvector('english', extracted_text));

-- Insert sample states for reference (optional)
-- This can help with data validation and dropdowns in the frontend
CREATE TABLE IF NOT EXISTS reference_states (
    id SERIAL PRIMARY KEY,
    state_name VARCHAR(100) NOT NULL UNIQUE,
    state_code VARCHAR(10),
    is_tribal_area BOOLEAN DEFAULT false
);

-- Insert sample Indian states
INSERT INTO reference_states (state_name, state_code, is_tribal_area) VALUES
('Andhra Pradesh', 'AP', true),
('Arunachal Pradesh', 'AR', true),
('Assam', 'AS', true),
('Bihar', 'BR', false),
('Chhattisgarh', 'CG', true),
('Goa', 'GA', false),
('Gujarat', 'GJ', true),
('Haryana', 'HR', false),
('Himachal Pradesh', 'HP', true),
('Jharkhand', 'JH', true),
('Karnataka', 'KA', true),
('Kerala', 'KL', true),
('Madhya Pradesh', 'MP', true),
('Maharashtra', 'MH', true),
('Manipur', 'MN', true),
('Meghalaya', 'ML', true),
('Mizoram', 'MZ', true),
('Nagaland', 'NL', true),
('Odisha', 'OR', true),
('Punjab', 'PB', false),
('Rajasthan', 'RJ', true),
('Sikkim', 'SK', true),
('Tamil Nadu', 'TN', true),
('Telangana', 'TG', true),
('Tripura', 'TR', true),
('Uttar Pradesh', 'UP', false),
('Uttarakhand', 'UK', true),
('West Bengal', 'WB', true)
ON CONFLICT (state_name) DO NOTHING;

-- Create function to automatically update timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_date = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Print initialization message
DO $$
BEGIN
    RAISE NOTICE 'FRA Atlas 360 database initialized successfully with PostGIS support';
END $$;