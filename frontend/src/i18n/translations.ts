export const translations = {
    en: {
        settings: {
            title: 'System Logic',
            subtitle: 'Customize application behavior and regional protocols',
            notificationMatrix: 'Notification Matrix',
            interface: 'Interface Customization',
            theme: 'Theme Preference',
            language: 'Language / Region',
            save: 'Authorize Logic Sync',
            successTitle: 'Settings Saved',
            successMsg: 'System preferences updated successfully',
            themes: {
                dark: 'Dark Mode (Default)',
                light: 'Light Mode',
                system: 'System Sync'
            },
            languages: {
                en: 'English (US)',
                id: 'Bahasa Indonesia',
                es: 'Español'
            }
        },
        common: {
            dashboard: 'Dashboard',
            pipelines: 'Pipelines',
            builder: 'Pipeline Builder',
            monitoring: 'Monitoring',
            import: 'Data Import',
            export: 'Data Export',
            personnel: 'Personnel Control'
        }
    },
    id: {
        settings: {
            title: 'Logika Sistem',
            subtitle: 'Sesuaikan perilaku aplikasi dan protokol regional',
            notificationMatrix: 'Matriks Notifikasi',
            interface: 'Kustomisasi Antarmuka',
            theme: 'Preferensi Tema',
            language: 'Bahasa / Wilayah',
            save: 'Otorisasi Sinkronisasi Logika',
            successTitle: 'Pengaturan Disimpan',
            successMsg: 'Preferensi sistem berhasil diperbarui',
            themes: {
                dark: 'Mode Gelap (Default)',
                light: 'Mode Terang',
                system: 'Sinkronisasi Sistem'
            },
            languages: {
                en: 'Inggris (US)',
                id: 'Bahasa Indonesia',
                es: 'Spanyol'
            }
        },
        common: {
            dashboard: 'Dasbor',
            pipelines: 'Saluran Data',
            builder: 'Pembuat Saluran',
            monitoring: 'Pemantauan',
            import: 'Impor Data',
            export: 'Ekspor Data',
            personnel: 'Kendali Personel'
        }
    },
    es: {
        settings: {
            title: 'Lógica del Sistema',
            subtitle: 'Personalizar el comportamiento de la aplicación y los protocolos regionales',
            notificationMatrix: 'Matriz de Notificaciones',
            interface: 'Personalización de Interfaz',
            theme: 'Preferencia de Tema',
            language: 'Idioma / Región',
            save: 'Autorizar Sincronización de Lógica',
            successTitle: 'Ajustes Guardados',
            successMsg: 'Preferencias del sistema actualizadas con éxito',
            themes: {
                dark: 'Modo Oscuro (Predeterminado)',
                light: 'Modo Claro',
                system: 'Sincronización del Sistema'
            },
            languages: {
                en: 'Inglés (EE. UU.)',
                id: 'Indonesio',
                es: 'Español'
            }
        },
        common: {
            dashboard: 'Tablero',
            pipelines: 'Canales de Datos',
            builder: 'Constructor de Canales',
            monitoring: 'Monitoreo',
            import: 'Importación de Datos',
            export: 'Exportación de Datos',
            personnel: 'Control de Personal'
        }
    }
};

export type Language = keyof typeof translations;
export type TranslationKey = typeof translations.en;
