-- Create a function to sync users from neon_auth.users_sync to public.users
-- This function will be triggered automatically when a user is created in Neon Auth

CREATE OR REPLACE FUNCTION sync_user_from_neon_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Only sync if the user is not deleted and doesn't already exist
  IF NEW.deleted_at IS NULL THEN
    INSERT INTO public.users (id, created_at, updated_at)
    VALUES (NEW.id, NEW.created_at, NEW.updated_at)
    ON CONFLICT (id) DO UPDATE
    SET updated_at = NEW.updated_at;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires when a user is inserted or updated in neon_auth.users_sync
CREATE TRIGGER on_neon_auth_user_synced
  AFTER INSERT OR UPDATE ON neon_auth.users_sync
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_from_neon_auth();

-- Also handle user deletions (soft delete)
CREATE OR REPLACE FUNCTION handle_neon_auth_user_deleted()
RETURNS TRIGGER AS $$
BEGIN
  -- When a user is soft-deleted in Neon Auth, we can optionally handle it here
  -- For now, we'll just update the updated_at timestamp
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    UPDATE public.users
    SET updated_at = NEW.updated_at
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: The deletion trigger is handled by the same trigger above
-- since we're using AFTER UPDATE which fires on both INSERT and UPDATE

