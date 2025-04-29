const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    minimize: () => ipcRenderer.send('minimize-window'),
    close: () => ipcRenderer.send('close-window'),
    dragWindow: () => ipcRenderer.send('drag-window'),
    confirmarApagar: () => ipcRenderer.invoke('confirmar-apagar'),
    confirmarAcao: (title, message, detail) => ipcRenderer.invoke('confirmarAcao', {title, message, detail}),
    showMessageDialog: (title, message) => ipcRenderer.invoke('showMessage', {title, message}),
    showMessageDialogg: (title, message) => ipcRenderer.invoke('show-message-dialog', {title, message}),
    showErrorDialog: (title, message) => ipcRenderer.invoke('show-error-dialog', {title, message}),
    

    getLivros: () => ipcRenderer.invoke('get-livros'),
    getLivroById: (id) => ipcRenderer.invoke('get-livro-by-id', id),
    addLivro: (livro) => ipcRenderer.invoke('add-livro', livro),
    updateLivro: (id, livro) => ipcRenderer.invoke('update-livro', id, livro),
    deleteLivro: (id) => ipcRenderer.invoke('delete-livro', id),
    
    // Operações com Usuários
    getUsuarios: () => ipcRenderer.invoke('get-usuarios'),
    getUsuarioByMatricula: (matricula) => ipcRenderer.invoke('get-usuario-by-matricula', matricula),
    addUsuario: (usuario) => ipcRenderer.invoke('add-usuario', usuario),
    updateUsuario: (matricula, usuario) => ipcRenderer.invoke('update-usuario', matricula, usuario),
    deleteUsuario: (matricula) => ipcRenderer.invoke('delete-usuario', matricula),

    // Operações com Empréstimos
    getEmprestimos: () => ipcRenderer.invoke('get-emprestimos'),
    getEmprestimosAtivos: () => ipcRenderer.invoke('get-emprestimos-ativos'),
    addEmprestimo: (emprestimo) => ipcRenderer.invoke('add-emprestimo', emprestimo),
    updateEmprestimo: (id, emprestimo) => ipcRenderer.invoke('update-emprestimo', id, emprestimo),
    registrarDevolucao: (id) => ipcRenderer.invoke('registrar-devolucao', id),
    extenderPrazoEmprestimo: (id, novaData) => ipcRenderer.invoke('extenderPrazoEmprestimo', id, novaData),

    // Operações com Bibliotecários
    getBibliotecarios: () => ipcRenderer.invoke('get-bibliotecarios'),
    getBibliotecarioByLogin: (login) => ipcRenderer.invoke('get-bibliotecario-by-login', login),
    
    addBibliotecario: (bibliotecario) => ipcRenderer.invoke('add-bibliotecario', bibliotecario),
    deleteBibliotecario: (matricula) => ipcRenderer.invoke('delete-bibliotecario', matricula),

    // Outras funções
    getCategorias: () => ipcRenderer.invoke('get-categorias'),
    getLivrosDisponiveis: () => ipcRenderer.invoke('get-livros-disponiveis'),

    login: (credenciais) => ipcRenderer.invoke('login', credenciais),
    
});