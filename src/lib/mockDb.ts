
export interface Appointment {
    id: string;
    user_id?: string;
    service_id?: any;
    barber_id?: any;
    start_time: string;
    status: string;
    // Enhanced fields for Mock
    services?: { name: string; price: number; duration_minutes?: number };
    barbers?: { name: string; avatar_url?: string };
    profiles?: { full_name: string; phone: string };
}

export const MockDB = {
    KEY: 'jacare_appointments',

    getAppointments: (): Appointment[] => {
        try {
            const data = localStorage.getItem(MockDB.KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    addAppointment: (appointment: Omit<Appointment, 'id'>) => {
        const current = MockDB.getAppointments();
        const newAppointment = {
            ...appointment,
            id: Date.now().toString(), // Simple ID generation
        };
        const updated = [...current, newAppointment];
        localStorage.setItem(MockDB.KEY, JSON.stringify(updated));
        return newAppointment;
    }
};
