
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
    },

    updateAppointment: (id: string, updates: Partial<Appointment>) => {
        const current = MockDB.getAppointments();
        const index = current.findIndex(a => a.id === id);
        if (index !== -1) {
            current[index] = { ...current[index], ...updates };
            localStorage.setItem(MockDB.KEY, JSON.stringify(current));
            return true;
        }
        return false;
    },

    // --- USER PAYMENT SIMULATION ---
    USER_KEY: 'jacare_users_status_v5',
    PENDING_REQUESTS_KEY: 'jacare_pending_requests_v5',

    updateUserStatus: (userId: string, status: 'approved' | 'pending' | 'blocked') => {
        const users = JSON.parse(localStorage.getItem('jacare_users_status_v5') || '{}');
        users[userId] = status;
        localStorage.setItem('jacare_users_status_v5', JSON.stringify(users));

        // If approved, remove from pending requests
        if (status === 'approved') {
            const requests = JSON.parse(localStorage.getItem('jacare_pending_requests_v5') || '[]');
            const newRequests = requests.filter((r: any) => r.userId !== userId);
            localStorage.setItem('jacare_pending_requests_v5', JSON.stringify(newRequests));
        }
    },

    getUserStatus: (userId: string): 'approved' | 'pending' | 'blocked' => {
        const users = JSON.parse(localStorage.getItem('jacare_users_status_v5') || '{}');
        return users[userId] || 'pending'; // Default to pending
    },

    addPendingRequest: (user: any) => {
        const requests = JSON.parse(localStorage.getItem('jacare_pending_requests_v5') || '[]');
        // Check if already exists
        if (!requests.find((r: any) => r.userId === user.id)) {
            requests.push({
                userId: user.id,
                email: user.email,
                name: user.user_metadata?.full_name || 'Usuário',
                phone: user.user_metadata?.phone || '',
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('jacare_pending_requests_v5', JSON.stringify(requests));
        }
    },

    getPendingRequests: () => {
        return JSON.parse(localStorage.getItem('jacare_pending_requests_v5') || '[]');
    }
};
