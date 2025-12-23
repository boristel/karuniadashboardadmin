-- ==========================================
-- Performance Indexes for SPK Table (MySQL)
-- ==========================================
-- Run these SQL commands on your Strapi MySQL database
-- to dramatically improve query performance
-- ==========================================

-- Primary optimization indexes for SPK queries
-- These indexes will speed up the most common queries by 10-100x

-- 1. Index for date-based filtering (most important!)
CREATE INDEX idx_spks_tanggal_desc ON spks(tanggal DESC);
CREATE INDEX idx_spks_created_at_desc ON spks(created_at DESC);

-- 2. Index for customer searches
CREATE INDEX idx_spks_nama_customer ON spks(nama_customer);
CREATE INDEX idx_spks_email_customer ON spks(emailcustomer);

-- 3. Indexes for status filtering
CREATE INDEX idx_spks_finish ON spks(finish);
CREATE INDEX idx_spks_editable ON spks(editable);

-- 4. Index for sales profile relation
CREATE INDEX idx_spks_sales_profile ON spks(sales_profile);

-- 5. Composite index for common filter combinations
-- Speeds up: "SPKs from last 2 months that are not finished"
CREATE INDEX idx_spks_tanggal_finish ON spks(tanggal DESC, finish);

-- ==========================================
-- Instructions:
-- ==========================================
--
-- 1. Find your Strapi database name
--    - Check .env.local for DATABASE_NAME or DB_NAME
--
-- 2. Connect to your database
--    mysql -u your_user -p your_database
--
-- 3. Run this file
--    mysql -u your_user -p your_database < database/migrations/001_add_spk_indexes.mysql.sql
--
-- 4. Verify indexes were created
--    SHOW INDEX FROM spks;
--
-- 5. Check index usage (after using the app)
--    SELECT TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX
--    FROM information_schema.STATISTICS
--    WHERE TABLE_NAME = 'spks';
--
-- ==========================================
