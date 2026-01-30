-- Set admin role for testadmin@test.com
UPDATE members SET role = 'ADMIN' WHERE email = 'testadmin@test.com';
