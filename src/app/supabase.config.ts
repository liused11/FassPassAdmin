import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://unxcjdypaxxztywplqdv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVueGNqZHlwYXh4enR5d3BscWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTA1NTQsImV4cCI6MjA3NzMyNjU1NH0.vf6ox-MLQsyzQgPCF9t6t_yPbcoMhJJNkJd1A-mS7WA';

// ✅ ต้องมีคำว่า export ด้วย เพื่อให้ไฟล์อื่นดึงไปใช้ได้
export const supabase = createClient(supabaseUrl, supabaseKey);