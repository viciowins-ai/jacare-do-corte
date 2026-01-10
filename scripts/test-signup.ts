
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from parent directory (jacare-do-corte root)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
// console.log('Key:', supabaseAnonKey); // Don't log key

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignup() {
    const email = `test_script_${Math.floor(Math.random() * 1000)}@example.com`;
    const password = 'password123';

    console.log(`Attempting to sign up with: ${email}`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: 'Script Tester',
                phone: '+5511999999999'
            }
        }
    });

    if (error) {
        console.error('Signup Error:', error.message);
        console.error('Full Error:', error);
    } else {
        console.log('Signup Successful!');
        console.log('User ID:', data.user?.id);
        console.log('Session:', data.session ? 'Active' : 'Null (Email Confirmation Required)');
    }
}

testSignup();
