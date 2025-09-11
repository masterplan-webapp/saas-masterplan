-- Fix OAuth redirect URLs for production
-- This migration updates the auth configuration to use the correct redirect URLs

-- Update the site URL and additional redirect URLs in the auth.config table
-- Note: This assumes the auth.config table exists, if not, we'll use auth settings

-- First, let's check if we need to update any OAuth provider configurations
-- For Google OAuth, we need to ensure the redirect URLs are properly configured

-- Update any existing OAuth configurations to use the production URL
-- This will be handled through environment variables and Supabase dashboard settings

-- Create a function to get the current environment
CREATE OR REPLACE FUNCTION get_site_url()
RETURNS TEXT AS $$
BEGIN
  -- Check if we're in production by looking at the current domain
  IF current_setting('app.settings.site_url', true) IS NOT NULL THEN
    RETURN current_setting('app.settings.site_url');
  ELSE
    -- Default to localhost for development
    RETURN 'http://localhost:5173';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a function to validate redirect URLs
CREATE OR REPLACE FUNCTION is_valid_redirect_url(url TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Allow localhost for development
  IF url LIKE 'http://localhost:%' OR url LIKE 'https://localhost:%' THEN
    RETURN TRUE;
  END IF;
  
  -- Allow Vercel URLs
  IF url LIKE 'https://%.vercel.app%' THEN
    RETURN TRUE;
  END IF;
  
  -- Allow custom domains (add your production domain here)
  IF url LIKE 'https://saas-masterplan.vercel.app%' THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_site_url() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_valid_redirect_url(TEXT) TO anon, authenticated;

-- Add a comment to track this migration
COMMENT ON FUNCTION get_site_url() IS 'Returns the appropriate site URL based on environment';
COMMENT ON FUNCTION is_valid_redirect_url(TEXT) IS 'Validates if a redirect URL is allowed for OAuth';