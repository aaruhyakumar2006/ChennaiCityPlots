-- Update Admin table structure to remove password and add role/active fields
ALTER TABLE "Admin" DROP COLUMN IF EXISTS "password" CASCADE;
ALTER TABLE "Admin" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'admin';
ALTER TABLE "Admin" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Admin" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create or replace a function to check if an email is an admin
CREATE OR REPLACE FUNCTION is_admin(email_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM "Admin"
    WHERE LOWER("email") = LOWER(email_param)
    AND "active" = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_admin(TEXT) TO authenticated, anon;
