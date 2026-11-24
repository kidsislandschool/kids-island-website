-- Staff access policies using auth_user_id UUID column
CREATE POLICY "Staff can read own profile" ON staff FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "Staff can update own profile" ON staff FOR UPDATE USING (auth.uid() = auth_user_id);
CREATE POLICY "Staff can read own materials" ON materials FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "Staff can insert own materials" ON materials FOR INSERT WITH CHECK (auth.uid() = auth_user_id);
CREATE POLICY "Staff can update own materials" ON materials FOR UPDATE USING (auth.uid() = auth_user_id);
CREATE POLICY "Staff can read own notices" ON notices FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "Staff can insert own notices" ON notices FOR INSERT WITH CHECK (auth.uid() = auth_user_id);
CREATE POLICY "Staff can update own notices" ON notices FOR UPDATE USING (auth.uid() = auth_user_id);