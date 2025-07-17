/*
  # Add Admin Role and Credentials

  1. New Functions
    - `create_admin_user` - Creates an admin user with specified email and password
    - `check_is_admin` - Checks if the current user is an admin

  2. Admin Setup
    - Creates a sample admin user with credentials
    - Sets up role-based authentication
*/

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND email = 'admin@spl.com'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create admin user
CREATE OR REPLACE FUNCTION create_admin_user(admin_email TEXT, admin_password TEXT)
RETURNS TEXT AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Create the user in auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin User", "is_admin": true}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Return success message
  RETURN 'Admin user created with ID: ' || new_user_id;
EXCEPTION
  WHEN unique_violation THEN
    RETURN 'Admin user already exists with that email';
  WHEN OTHERS THEN
    RETURN 'Error creating admin user: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create sample admin user (email: admin@spl.com, password: Admin123!)
SELECT create_admin_user('admin@spl.com', 'Admin123!');