import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.jacaredocorte.app',
    appName: 'Jacaré do Corte',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    }
};

export default config;
