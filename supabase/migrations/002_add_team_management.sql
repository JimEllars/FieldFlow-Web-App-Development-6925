-- Team invitations table for managing user invitations
CREATE TABLE IF NOT EXISTS team_invitations_ff2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies_ff2024(id) ON DELETE CASCADE,
  
  -- Invitation details
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  
  -- Invitation status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  token UUID DEFAULT gen_random_uuid(),
  
  -- Metadata
  invited_by UUID NOT NULL REFERENCES profiles_ff2024(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique active invitations per email per company
  UNIQUE(company_id, email, status) DEFERRABLE INITIALLY DEFERRED
);

-- Enable RLS on team invitations
ALTER TABLE team_invitations_ff2024 ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Team Invitations
CREATE POLICY "Team invitations are viewable by company admins" 
ON team_invitations_ff2024 FOR SELECT USING (
  company_id IN (
    SELECT company_id FROM profiles_ff2024 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Team invitations are manageable by company admins" 
ON team_invitations_ff2024 FOR ALL USING (
  company_id IN (
    SELECT company_id FROM profiles_ff2024 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Function to automatically expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
  UPDATE team_invitations_ff2024 
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending' 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle invitation acceptance
CREATE OR REPLACE FUNCTION accept_team_invitation(invitation_token UUID, user_id UUID)
RETURNS boolean AS $$
DECLARE
  invitation_record team_invitations_ff2024%ROWTYPE;
BEGIN
  -- Find the invitation
  SELECT * INTO invitation_record
  FROM team_invitations_ff2024
  WHERE token = invitation_token 
    AND status = 'pending' 
    AND expires_at > NOW();
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Update the user's profile
  UPDATE profiles_ff2024 SET
    company_id = invitation_record.company_id,
    name = invitation_record.name,
    role = invitation_record.role,
    is_active = true,
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Mark invitation as accepted
  UPDATE team_invitations_ff2024 SET
    status = 'accepted',
    accepted_at = NOW(),
    updated_at = NOW()
  WHERE id = invitation_record.id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updated_at on team invitations
CREATE TRIGGER update_team_invitations_updated_at 
  BEFORE UPDATE ON team_invitations_ff2024 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_invitations_company_id ON team_invitations_ff2024 (company_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations_ff2024 (email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations_ff2024 (token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations_ff2024 (status);
CREATE INDEX IF NOT EXISTS idx_team_invitations_expires_at ON team_invitations_ff2024 (expires_at);

-- Grant permissions
GRANT ALL ON team_invitations_ff2024 TO authenticated;

-- Schedule automatic cleanup of expired invitations (if supported)
-- This would typically be done via a cron job or scheduled function
-- For now, we'll rely on manual cleanup or application-level cleanup