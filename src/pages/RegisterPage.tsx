import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// O cadastro agora é feito exclusivamente via Google.
// Esta rota redireciona para o login caso alguém acesse /register diretamente.
export function RegisterPage() {
    const navigate = useNavigate();
    useEffect(() => {
        navigate('/login', { replace: true });
    }, [navigate]);
    return null;
}
