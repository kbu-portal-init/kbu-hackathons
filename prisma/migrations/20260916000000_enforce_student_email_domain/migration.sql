ALTER TABLE "team_member"
ADD CONSTRAINT "team_member_student_email_ms_kbu_domain"
CHECK ("studentEmail" ~* '^[^@[:space:]]+@ms[.]kbu[.]ac[.]th$');
