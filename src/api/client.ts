import axios from 'axios';
import { supabase } from '../lib/supabase';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'https://localhost:64868',
});

client.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
});

export default client;
