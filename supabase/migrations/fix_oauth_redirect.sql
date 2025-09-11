-- Check available auth tables and settings
-- Since auth.config doesn't exist, let's check what's available

-- List all tables in auth schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'auth';

-- Check if there are any auth-related settings we can view
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'auth';

-- Check current auth users to ensure auth is working
SELECT id, email, created_at 
FROM auth.users 
LIMIT 5;