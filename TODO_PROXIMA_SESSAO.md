# Próximos Passos - Publicação Jacaré do Corte

## Onde paramos
- **Problema de Chave**: O Google Play rejeitou o upload porque a chave de assinatura mudou (perdemos a senha da antiga).
- **Solução em andamento**: Geramos um novo certificado (`upload_certificate.pem`) para solicitar a redefinição da chave de upload no Google Play Console.
- **Arquivo de Certificado**: O arquivo `upload_certificate.pem` já está na pasta `android-twa`.

## Tarefas Pendentes
1. **Solicitar Redefinição de Chave (Ação do Usuário)**:
   - Acessar o Google Play Console.
   - Ir em **Configuração** > **Assinatura de apps** (ou **Integridade do app**).
   - Clicar em "Solicitar atualização de chave" ou "Mudar chave de assinatura".
   - Escolher a opção "Perdi minha chave de upload".
   - Fazer upload do arquivo `android-twa/upload_certificate.pem`.

2. **Aguardar Google**:
   - O Google pode levar até 48h para processar a nova chave.
   - Eles enviarão um e-mail de confirmação.

3. **Novo Upload**:
   - Assim que a nova chave for aceita, fazer o upload do arquivo: `android-twa/app-release-signed.aab`.
