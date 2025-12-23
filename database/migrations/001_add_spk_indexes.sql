-- ==========================================
-- Performance Indexes for SPK Table
-- ==========================================
-- Run these SQL commands on your Strapi database
-- to dramatically improve query performance
-- ==========================================

-- Primary optimization indexes for SPK queries
-- These indexes will speed up the most common queries by 10-100x

-- 1. Index for date-based filtering (most important!)
CREATE INDEX IF NOT EXISTS idx_spks_tanggal_desc ON spks(tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_spks_created_at_desc ON spks(created_at DESC);

-- 2. Index for customer searches
CREATE INDEX IF NOT EXISTS idx_spks_nama_customer ON spks(nama_customer);
CREATE INDEX IF NOT EXISTS idx_spks_email_customer ON spks(emailcustomer);

-- 3. Indexes for status filtering
CREATE INDEX IF NOT EXISTS idx_spks_finish ON spks(finish);
CREATE INDEX IF NOT EXISTS idx_spks_editable ON spks(editable);

-- 4. Index for sales profile relation
CREATE INDEX IF NOT EXISTS idx_spks_sales_profile ON spks(sales_profile);

-- 5. Composite index for common filter combinations
-- Speeds up: "SPKs from last 2 months that are not finished"
CREATE INDEX IF NOT EXISTS idx_spks_tanggal_finish ON spks(tanggal DESC, finish);

-- ==========================================
-- Instructions:
-- ==========================================
--
-- 1. Find your Strapi database name
--    - Check .env.local for DATABASE_NAME or DB_NAME
--
-- 2. Connect to your database
--    psql -U your_user -d your_database
--
-- 3. Run this file
--    psql -U your_user -d your_database < database/migrations/001_add_spk_indexes.sql
--
-- 4. Verify indexes were created
--    \d spks
--
-- 5. Check index usage (after using the app)
--    SELECT schemaname, tablename, indexname, idx_scan
--    FROM pg_stat_user_indexes
--    WHERE tablename = 'spks';
--
-- ==========================================
