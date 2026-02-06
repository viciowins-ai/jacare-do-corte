# Próximos Passos - Jacaré do Corte

## Estado Atual (03/02/2026 - Noite)
- **App:** Funcional e rodando localmente.
- **Servidor:** Parado (deve iniciar com `npm run dev`).
- **Tarefa em Andamento:** Configuração do SMTP no Supabase.

## 🛑 Onde Paramos (Ponto de Retorno)
Você já gerou a **Senha de App do Google** (16 letras), mas falta **salvar no Supabase**.

### 1. Ao abrir o computador:
1.  Acesse: [supabase.com/dashboard](https://supabase.com/dashboard) > Projeto "Jacaré do Corte".
2.  No menu lateral esquerdo (barra preta fina), clique em **Authentication** (ícone de bonequinhos).
3.  Na lista ao lado da barra preta, clique em **Email** (abaixo de "NOTIFICATIONS").
4.  Ative **Enable Custom SMTP**.

### 2. Preencha os dados:
*   **Sender Email:** Seu e-mail do Gmail.
*   **Sender Name:** `Jacaré do Corte`
*   **Host:** `smtp.gmail.com`
*   **Port:** `465`
*   **User:** Seu e-mail do Gmail.
*   **Password:** A senha de 16 letras gerada no Google (se perdeu, gere outra em `myaccount.google.com/apppasswords`).

---

## Próximos Passos (Pós-Configuração)
1.  **Salvar** as configurações no Supabase.
2.  **Testar Cadastro:** Criar um usuário novo no app para ver se o e-mail chega.
3.  **Testar Android:** Se tudo funcionar, o app mobile também funcionará.

