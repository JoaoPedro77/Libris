/////////////////////////////////////////////////////////////////////////////////////////////////////
// 1. CONSTANTES E VARIÁVEIS GLOBAIS 🛵
/////////////////////////////////////////////////////////////////////////////////////////////////////

/* 
 * Variáveis globais que armazenam os dados da aplicação.
 * Inicializadas com dados do localStorage ou valores padrão.
 */

// Lista de empréstimos
let lista_emprestimos = JSON.parse(localStorage.getItem('emprestimos')) || [
    {
        usuario: "jorge da silva",
        livro: "JavaScript para Iniciantes",
        livro_id: "001",
        matricula: "20230101",
        dataEmprestimo: "01/04/2025",
        dataDevolucao: "15/04/2025",
        dataDevolvido: "14/04/2025",
        multa: 0,
        status: "devolvido"
    },
    {
        usuario: "Maria Souza",
        livro: "Aprendendo React",
        livro_id: "002",
        matricula: "20230102",
        dataEmprestimo: "26/04/2025",
        dataDevolucao: "10/05/2025",
        dataDevolvido: null,
        multa: 0,
        status: "ativo"
    },
    {
        usuario: "marcelo rogerio algusto da silva souza silva silva",
        livro: "Python para Todos",
        livro_id: "003",
        matricula: "20230103",
        dataEmprestimo: "10/04/2025",
        dataDevolucao: "24/04/2025",
        dataDevolvido: null,
        multa: 10,
        status: "atrasado"
    }
];

// Lista de usuários
let lista_usuarios = JSON.parse(localStorage.getItem('usuarios')) || [
    { matricula: "20230101", nome: "jorge da silva", curso: "Engenharia de Software", telefone: "11999999999", email: "jorgee@example.com" },
    { matricula: "20230102", nome: "Maria Souza", curso: "Sistemas de Informação", telefone: "11888888888", email: "mariaa@example.com" },
    { matricula: "20230103", nome: "marcelo rogerio algusto da silva souza silva silva", curso: "Análise e Desenvolvimento de Sistemas", telefone: "11777777777", email: "mrassss@example.com" }
];

// Lista de livros
let lista_livros = JSON.parse(localStorage.getItem('livros')) || [
    { id_livro: "001", titulo: "JavaScript para Iniciantes", autor: "John Doe", isbn: "1234567890", ano_publicado: 2020, id_categoria: "12", disponibilidade: "Disponível" },
    { id_livro: "002", titulo: "Aprendendo React", autor: "Jane Smith", isbn: "0987654321", ano_publicado: 2021, id_categoria: "12", disponibilidade: "Indisponível" },
    { id_livro: "003", titulo: "Python para Todos", autor: "Pedro Santos", isbn: "1122334455", ano_publicado: 2019, id_categoria: "12", disponibilidade: "Indisponível" }
];

// Lista de bibliotecários
let bibliotecarios = JSON.parse(localStorage.getItem('bibliotecarios')) || [
    { login: "a", senha: "a", nome: "Ana Silva", matricula: "12345"},
    { login: "admin", senha: "admin", nome: "admin", matricula: "00000"},
    
];


// Mapeamento de categorias de livros
const categoriasMap = {
    '1': 'Física',
    '2': 'Química',
    '3': 'Biologia',
    '4': 'Matemática',
    '5': 'Literatura',
    '6': 'Português',
    '7': 'Inglês',
    '8': 'Geografia',
    '9': 'História',
    '10': 'Filosofia',
    '11': 'Sociologia',
    '12': 'Tecnologia e Computação',
    '13': 'Técnicos/Profissionalizantes',
    '14': 'Revistas',
    '15': 'Projeto de Vida',
    '16': 'Educação Física',
    '17': 'Artes'
};



/////////////////////////////////////////////////////////////////////////////////////////////////////
// 2. FUNÇÕES DE INICIALIZAÇÃO E CONTROLE DA APLICAÇÃO
/////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Evento principal que é disparado quando o DOM está totalmente carregado
 * Configura toda a aplicação, carrega dados e define os listeners
 */

document.addEventListener("DOMContentLoaded", () => {
    // Carrega a navbar apropriada baseada no parâmetro 'tipo' da URL
    const tipo = getQueryParam("tipo");
    if (tipo) {
        loadNavbarWithTipo();
    } else {
        loadNavbar();
    }

    // Configura todos os formulários da aplicação
    setupForms();
    
    // Configura a página atual baseada no tipo
    setupPage(tipo);
    
    // Carrega os dados iniciais
    carregarDadosIniciais();
    
    // Carrega estatísticas do dashboard
    carregarEstatisticas();
});

/**
 * Configura todos os formulários da aplicação
 * Adiciona event listeners e validações
 */
function setupForms() {
    setupEmprestimoForm();
    setupLivroForm();
    setupUsuarioForm();
    setupBibliotecarioForm();
    setupLoginForm();
}

/**
 * Configura a exibição da página baseada no tipo
 */
function setupPage(tipo) {
    // Esconde todas as seções principais primeiro
    hideAllSections();
    
    // Mostra a seção apropriada baseada no tipo
    showSectionByType(tipo);
}

/**
 * Carrega os dados iniciais necessários
 */
function carregarDadosIniciais() {
    carregarEmprestimos();
    carregarUsuarios();
    carregarLivros();
    carregarBibliotecarios();
    carregarEmprestimosParaDevolucao();
}


/////////////////////////////////////////////////////////////////////////////////////////////////////
// 3. FUNÇÕES DE NAVBAR E CONTROLE DE JANELA
/////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Carrega a navbar básica
 */
async function loadNavbar() {
    try {
        const response = await fetch('navbar.html');
        const html = await response.text();
        document.getElementById('navbar-container').innerHTML = html;
        setupWindowButtons();

        const logoutBtn = document.getElementById('logout-btn');

        // Verifica se estamos na página de login
        const isLoginPage = window.location.pathname.includes('login.html');

        if (logoutBtn) {
            if (isLoginPage) {
                // Oculta o botão de logout
                logoutBtn.style.display = 'none';
            } else {
                // Adiciona o event listener normalmente
                logoutBtn.addEventListener('click', () => {
                    window.localStorage.removeItem('loggedIn');
                    console.log("Usuário deslogado");
                    window.location.assign("login.html");
                });
            }
        }

    } catch (error) {
        console.error('Erro ao carregar navbar:', error);
    }
}

/**
 * Carrega a navbar com tipo específico (com botão de voltar e título)
 */
async function loadNavbarWithTipo() {
    const tipo = getQueryParam("tipo");

    const titulos = {
        emprestimos: "Consulta de Empréstimos",
        usuarios: "Gestão de Usuários",
        livros: "Gerenciar Acervo",
        usuario: "Cadastro de Usuário",
        livro: "Cadastro de Livros",
        bibliotecario: "Cadastro de Bibliotecário",
        emprestar:"Novo Empréstimo",
        devolver:"Devolução de Livros"
    };

    const titulo = titulos[tipo] || "Página"; // fallback se não achar

    try {
        const response = await fetch('navbar2.html');
        const html = await response.text();
        document.getElementById('navbar-container').innerHTML = html;
        setupWindowButtons();

        // Depois de carregar, altera o título da navbar
        const titleEl = document.getElementById('navbar-page-title');
        if (titleEl) {
            titleEl.textContent = titulo;
        }

        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                history.back();
            });
        }

    } catch (error) {
        console.error('Erro ao carregar navbar com tipo:', error);
    }
}

/**
 * Configura os botões de controle da janela (minimizar, fechar, arrastar)
 */
function setupWindowButtons() {
    document.getElementById('minimize-btn')?.addEventListener('click', () => {
        window.electronAPI.minimize();
    });
    
    document.getElementById('close-btn')?.addEventListener('click', () => {
        window.electronAPI.close();
    });

    document.getElementById('draggable-header')?.addEventListener('mousedown', () => {
        window.electronAPI.dragWindow();
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
// 4. FUNÇÕES DE FORMULÁRIOS
/////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Configura o formulário de empréstimo
 */
function setupEmprestimoForm() {
    const emprestimoForm = document.querySelector(".emprestimo-form");
    if (emprestimoForm) {
        emprestimoForm.addEventListener("submit", function(e) {
            e.preventDefault();
    
            // Capturar elementos do formulário
            const selectUsuario = document.getElementById("select-usuario");
            const selectLivro = document.getElementById("select-livro");
            const dataEmprestimoInput = document.getElementById("data-emprestimo");
    
            // Capturar valores
            const matriculaSelecionada = selectUsuario.value;
            const livroSelecionado = selectLivro.value;
            const dataInput = new Date(dataEmprestimoInput.value);
            const dataEmprestimo = new Date(dataInput.getTime() + dataInput.getTimezoneOffset() * 60000);
    
            // Procurar usuário e livro nas listas
            const usuario = lista_usuarios.find(u => u.matricula === matriculaSelecionada);
            const livro = lista_livros.find(l => l.id_livro === livroSelecionado);
    
            if (!usuario || !livro) {
                window.electronAPI.showErrorDialog('Erro', 'Usuário ou livro não encontrado!');
                return;
            }
    
            // Calcular data de devolução (14 dias depois)
            const dataDevolucao = new Date(dataEmprestimo);
            dataDevolucao.setDate(dataEmprestimo.getDate() + 14);
    
            // Criar objeto do empréstimo
            const novoEmprestimo = {
                usuario: usuario.nome,
                livro: livro.titulo,
                livro_id: livro.id_livro,
                matricula: usuario.matricula,
                dataEmprestimo: formatarData(dataEmprestimo),
                dataDevolucao: formatarData(dataDevolucao),
                dataDevolvido: null,
                multa: 0,
                status: "ativo"
            };
    
            // Confirmar com o usuário antes de registrar
            window.electronAPI.confirmarAcao(
                'Confirmar Empréstimo', 
                `Deseja registrar o empréstimo de ${livro.titulo} para ${usuario.nome}?`,
                `Data de devolução: ${formatarData(dataDevolucao)}`
            ).then(confirmado => {
                if (confirmado) {
                    // Atualizar localStorage
                    let emprestimos = JSON.parse(localStorage.getItem('emprestimos')) || [];
                    emprestimos.push(novoEmprestimo);
                    localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
    
                    // Atualizar status do livro
                    livro.disponibilidade = "Indisponível";
                    localStorage.setItem('livros', JSON.stringify(lista_livros));
    
                    window.electronAPI.showMessageDialog(
                        'Sucesso', 
                        `Empréstimo registrado para ${usuario.nome}!`
                    );
    
                    // Limpar formulário
                    goTo("index.html");
                }
            }).catch(error => {
                console.error('Erro ao processar empréstimo:', error);
                window.electronAPI.showErrorDialog(
                    'Erro', 
                    'Ocorreu um erro ao registrar o empréstimo.'
                );
            });
        });
    }
}

/**
 * Configura o formulário de livro
 */
function setupLivroForm() {
    const livroForm = document.querySelector(".book-form");
    if (livroForm) {
        document.getElementById("id_livro")?.addEventListener("input", function() {
            validarIdLivro(this);
            atualizarEstadoBotaoLivro();
        });
    
        livroForm.addEventListener("submit", function(e) {
            if (!validarIdLivro(document.getElementById("id_livro"))) {
                e.preventDefault();
                return;
            }
    
            e.preventDefault();
            const livroData = {
                id_livro: document.getElementById("id_livro").value.trim(),
                titulo: document.getElementById("titulo").value.trim(),
                autor: document.getElementById("autor").value.trim(),
                isbn: document.getElementById("isbn").value.trim(),
                ano_publicado: parseInt(document.getElementById("ano_publicado").value),
                id_categoria: document.getElementById("id_categoria").value.trim(),
                disponibilidade: "Disponível" // <--- Adicionado aqui
            };
    
            lista_livros.push(livroData);
            localStorage.setItem('livros', JSON.stringify(lista_livros));
            goTo("index.html"); // Ou onde você quiser
        });
    }
}

/**
 * Configura o formulário de usuário
 */
function setupUsuarioForm() {
    const userForm = document.querySelector(".user-form");
    if (userForm) {
        // Validação em tempo real
        document.getElementById("matricula")?.addEventListener("input", function() {
            validarMatricula(this);
            atualizarEstadoBotao();
        });

        // Validação no submit
        userForm.addEventListener("submit", function(e) {
            if (!validarMatricula(document.getElementById("matricula"))) {
                e.preventDefault();
                return;
            }
            
            e.preventDefault();
            const userData = {
                nome: document.getElementById("nome").value.trim(),
                matricula: document.getElementById("matricula").value.trim(),
                curso: document.getElementById("curso").value.trim(),
                telefone: document.getElementById("telefone").value.trim(),
                email: document.getElementById("email").value.trim()
            };
            

            //da push na lista. ver depois com o banco de dados
            lista_usuarios.push(userData);
            localStorage.setItem('usuarios', JSON.stringify(lista_usuarios));
            goTo("index.html");
        });
    }
}

/**
 * Configura o formulário de bibliotecário
 */
function setupBibliotecarioForm() {
    const bibliotecarioForm = document.querySelector(".bibliotecario-form");
    if (bibliotecarioForm) {
        // Validação em tempo real
        document.getElementById("matricula-bibliotecario")?.addEventListener("input", function() {
            validarMatriculaBibliotecario(this);
            atualizarEstadoBotaoBibliotecario();
        });

        // Validação no submit
        bibliotecarioForm.addEventListener("submit", function(e) {
            if (!validarMatriculaBibliotecario(document.getElementById("matricula-bibliotecario"))) {
                e.preventDefault();
                return;
            }
            
            e.preventDefault();
            const userData = {
                login: document.getElementById("login").value.trim(),
                senha: document.getElementById("senha").value.trim(),
                nome: document.getElementById("nome_bibliotecario").value.trim(),
                matricula: document.getElementById("matricula-bibliotecario").value.trim(),
            };
            

            //da push na lista. ver depois com o banco de dados
            bibliotecarios.push(userData);
            localStorage.setItem('bibliotecarios', JSON.stringify(bibliotecarios));
            goTo("index.html");
            
        });
    }
}

/**
 * Configura o formulário de login
 */
function setupLoginForm() {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", function(e) {
            e.preventDefault(); // Impede que o formulário seja enviado de forma padrão
            
            //descomentar pra limpar tudo
            //localStorage.clear();

            // Captura os valores dos campos de login e senha
            const login = document.getElementById("login").value;
            const senha = document.getElementById("senha").value;
            const errorMsg = document.getElementById("login-error");

            // Debug: Verifica os valores de login e senha
            console.log("Login:", login); // Verifica se o valor de login está correto
            console.log("Senha:", senha); // Verifica se o valor de senha está correto

            // Verifica se os campos de login e senha não estão vazios
            if (!login || !senha) {
                console.log("Campos vazios!");
                errorMsg.textContent = "Por favor, preencha todos os campos.";
                errorMsg.style.display = "block"; // Exibe a mensagem de erro
                return; // Interrompe a execução do código
            }

            // Verifica se o login e senha correspondem a algum usuário
            const usuarioValido = bibliotecarios.find(u => u.login === login && u.senha === senha);

            if (usuarioValido) {
                console.log("Usuário válido!"); // Confirma que o usuário foi encontrado
                // Marca o usuário como logado no localStorage
                window.localStorage.setItem('loggedIn', true);
                // Usuário válido, redireciona para a página inicial
                goTo("index.html");
            } else {
                console.log("Login ou senha inválidos!"); // Confirma que o login não foi encontrado
                // Exibe mensagem de erro se o login for inválido
                errorMsg.textContent = "Login ou senha inválidos.";
                errorMsg.style.display = "block"; // Garante que o erro seja visível
            }
        });
    } 
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function() {
            // Limpa o item do localStorage para remover o estado de login
            window.localStorage.removeItem('loggedIn');
            console.log("Usuário deslogado");

            // Redireciona para a página de login após logout
            window.location.assign("login.html");; // Isso pode ser substituído por um método específico para Electron, se necessário
        });
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////
// 5. FUNÇÕES DE VALIDAÇÃO
/////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Valida se uma matrícula já existe
 */
function validarMatricula(input) {
    const matricula = input.value.trim();
    const submitBtn = document.getElementById('submit-btn');
    
    if (!matricula) return true; // Se vazio, deixa o required nativo tratar
    
    // Verifica duplicata
    const matriculaExistente = lista_usuarios.some(u => u.matricula === matricula);
    
    if (matriculaExistente) {
        input.setCustomValidity("Matrícula já cadastrada!");
        input.reportValidity(); // Mostra o balão de erro
        return false;
    } else {
        input.setCustomValidity(""); // Limpa erros
        return true;
    }
}

/**
 * Valida se um ID de livro já existe
 */
function validarIdLivro(input) {
    const idLivro = input.value.trim();
    if (!idLivro) return true;

    const idExistente = lista_livros.some(l => l.id_livro === idLivro);

    if (idExistente) {
        input.setCustomValidity("ID do livro já cadastrado!");
        input.reportValidity();
        return false;
    } else {
        input.setCustomValidity("");
        return true;
    }
}

/**
 * Valida se uma matrícula de bibliotecário já existe
 */
function validarMatriculaBibliotecario(input) {
    const matriculaBibliotecario = input.value.trim();
    
    if (!matriculaBibliotecario) return true; // Se vazio, deixa o required nativo tratar
    
    // Verifica duplicata
    const matriculaBilioExistente = bibliotecarios.some(u => u.matricula === matriculaBibliotecario);
    
    if (matriculaBilioExistente) {
        input.setCustomValidity("Matrícula já cadastrada!");
        input.reportValidity(); // Mostra o balão de erro
        return false;
    } else {
        input.setCustomValidity(""); // Limpa erros
        return true;
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////
// 6. FUNÇÕES DE CARREGAMENTO DE DADOS
/////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Carrega e exibe os empréstimos
 */
function carregarEmprestimos() {
    const todosEmprestimos = document.getElementById('todos-emprestimos');
    const emprestimosAtrasados = document.getElementById('emprestimos-atrasados-lista');
    
    if (!todosEmprestimos || !emprestimosAtrasados) return;
    
    // Atualiza status dos empréstimos antes de exibir
    atualizarStatusEmprestimos();
    
    // Ordenando os empréstimos para mostrar os "ativos" primeiro
    lista_emprestimos.sort((a, b) => {
        const statusOrder = { ativo: 1, atrasado: 2, devolvido: 3 };
        return statusOrder[a.status] - statusOrder[b.status];
    });
    
    // Limpando as listas antes de adicionar os novos cards
    todosEmprestimos.innerHTML = '';
    emprestimosAtrasados.innerHTML = '';
    
    lista_emprestimos.forEach(emprestimo => {
        const card = document.createElement('div');
        card.classList.add('emprestimo-card', emprestimo.status);
        
        let icone = "";
        if (emprestimo.status === "devolvido") {
            icone = `<i class="ph-duotone ph-check-circle icone-status"></i>`;
        } else if (emprestimo.status === "ativo") {
            icone = `<i class="ph-duotone ph-clock-countdown icone-status"></i>`;
        } else if (emprestimo.status === "atrasado") {
            icone = `<i class="ph-duotone ph-warning icone-status"></i>`;
        }
        
        card.innerHTML = `
            <div class="emprestimo-header">
                <div class="header-linha">
                    <strong><i class="ph-duotone ph-user-circle"></i> ${emprestimo.usuario}</strong>
                    <div class="matricula">${emprestimo.matricula}</div>
                </div>
                <div class="divider-livro">
                    <strong class="livro"><i class="ph-duotone ph-book"></i> ${emprestimo.livro}</strong>
                    <div class="id-livro">ID: ${emprestimo.livro_id}</div>
                </div>
            </div>
            
            <div class="emprestimo-dados">
                <div class="data-info">
                    <small>Empréstimo:</small>
                    ${emprestimo.dataEmprestimo}
                </div>
                <div class="data-info">
                    <small>Devolução:</small>
                    ${emprestimo.dataDevolucao}
                </div>
                ${icone}
            </div>
            
            ${
                emprestimo.status === "devolvido" 
                ? `<div class="status-info"><div class="status-texto">Devolvido: ${emprestimo.dataDevolvido}</div></div>`
                : ""
            }
            ${
                emprestimo.status === "ativo" 
                ? `<div class="status-info"><div class="status-texto">Emprestado</div></div>`
                : ""
            }
            ${
                emprestimo.status === "atrasado"
                ? `<div class="status-info">
                    <div class="status-texto">Em atraso.</div>
                    <div class="multa">Multa: R$ ${emprestimo.multa.toFixed(2)}</div>
                   </div>`
                : ""
            }
        `;
        
        if (emprestimo.status === "atrasado") {
            emprestimosAtrasados.appendChild(card);
        } else {
            todosEmprestimos.appendChild(card);
        }
    });
}

/**
 * Carrega e exibe os usuários
 */
function carregarUsuarios() {
    const lista = document.getElementById('lista-usuarios');
    if (!lista) return;

    lista.innerHTML = '';

    lista_usuarios.forEach((usuario, index) => {
        const li = document.createElement('li');
        li.classList.add('usuario-item');

        // Área da esquerda (ícone + info)
        const infoDiv = document.createElement('div');
        infoDiv.classList.add('info-usuario');

        const icon = document.createElement('i');
        icon.classList.add('ph-duotone', 'ph-identification-card');
        infoDiv.appendChild(icon);

        const texto = document.createTextNode(` ${usuario.matricula} - ${usuario.nome}`);
        infoDiv.appendChild(texto);

        // Botão de apagar
        const botaoApagar = document.createElement('i');
        botaoApagar.classList.add('ph-duotone', 'ph-trash', 'botao-apagar');
        botaoApagar.title = 'Apagar usuário';

        botaoApagar.onclick = (e) => {
            e.stopPropagation();
            apagarUsuario(index);
        };

        li.appendChild(infoDiv);
        li.appendChild(botaoApagar);
        li.onclick = () => mostrarDetalhes(usuario);
        lista.appendChild(li);
    });
}
/**
 * Carrega e exibe os livros
 */
function carregarLivros() {
    const lista = document.getElementById('lista-livros');
    if (!lista) return;

    lista.innerHTML = '';

    lista_livros.forEach((livro, index) => {
        const li = document.createElement('li');
        li.classList.add('livro-item');

        // Área da esquerda (ícone + info)
        const infoDiv = document.createElement('div');
        infoDiv.classList.add('info-livro');

        const icon = document.createElement('i');
        icon.classList.add('ph-duotone', 'ph-book');
        infoDiv.appendChild(icon);

        const texto = document.createTextNode(` ${livro.id_livro} - ${livro.titulo}`);
        infoDiv.appendChild(texto);

        // Botão de apagar
        const botaoApagar = document.createElement('i');
        botaoApagar.classList.add('ph-duotone', 'ph-trash', 'botao-apagar');
        botaoApagar.title = 'Apagar livro';

        botaoApagar.onclick = (e) => {
            e.stopPropagation();
            apagarLivro(index);
        };

        li.appendChild(infoDiv);
        li.appendChild(botaoApagar);
        li.onclick = () => mostrarDetalhesLivro(livro);
        lista.appendChild(li);
    });
}

/**
 * Carrega e exibe os bibliotecários
 */
function carregarBibliotecarios() {
    const lista = document.getElementById('listinha-bibliotecarios');
    if (!lista) return;

    lista.innerHTML = '';

    bibliotecarios.forEach((bibliotecario, index) => {
        const li = document.createElement('li');
        li.classList.add('bibliotecario-item'); // Classe pra estilizar depois

        // Área da esquerda (ícone + nome)
        const infoDiv = document.createElement('div');
        infoDiv.classList.add('info-bibliotecario');

        const icon = document.createElement('i');
        icon.classList.add('ph-duotone', 'ph-user');
        infoDiv.appendChild(icon);

        const texto = document.createTextNode(` ${bibliotecario.matricula} - ${bibliotecario.nome}`);
        infoDiv.appendChild(texto);

        // Botão de apagar (só a lixeira)
        const botaoApagar = document.createElement('i');
        botaoApagar.classList.add('ph-duotone', 'ph-trash', 'botao-apagar');
        botaoApagar.title = 'Apagar bibliotecário';

        botaoApagar.onclick = (e) => {
            e.stopPropagation(); // Só clica na lixeira
            apagarBibliotecario(index);
        };

        li.appendChild(infoDiv);
        li.appendChild(botaoApagar);
        lista.appendChild(li);
    });
}

/**
 * Carrega empréstimos ativos para a tela de devolução
 */
function carregarEmprestimosParaDevolucao() {
    const listaEmprestimos = document.getElementById('lista-emprestimos-ativos');
    if (!listaEmprestimos) return;

    // Limpa a lista antes de carregar
    listaEmprestimos.innerHTML = '';

    // Filtra apenas empréstimos ativos ou atrasados
    const emprestimosAtivos = lista_emprestimos.filter(e => e.status === 'ativo' || e.status === 'atrasado');

    if (emprestimosAtivos.length === 0) {
        listaEmprestimos.innerHTML = '<p class="placeholder-text">Nenhum empréstimo ativo no momento.</p>';
        return;
    }

    emprestimosAtivos.forEach(emprestimo => {
        const li = document.createElement('li');
        li.className = 'emprestimo-item';
        
        li.innerHTML = `
            <div class="emprestimo-info">
                <h3><i class="ph-duotone ph-user"></i> ${emprestimo.usuario}</h3>
                <p><i class="ph-duotone ph-identification-card"></i> Matrícula: ${emprestimo.matricula}</p>
                <p><i class="ph-duotone ph-book"></i> Livro: ${emprestimo.livro} (ID: ${emprestimo.livro_id})</p>
                <div class="data-info">
                    <span><i class="ph-duotone ph-calendar-blank"></i> Empréstimo: ${emprestimo.dataEmprestimo}</span>
                    <span><i class="ph-duotone ph-calendar-check"></i> Devolução: ${emprestimo.dataDevolucao}</span>
                    ${emprestimo.status === 'atrasado' ? 
                      `<span><i class="ph-duotone ph-warning"></i> Multa: R$ ${emprestimo.multa.toFixed(2)}</span>` : ''}
                </div>
            </div>
            <div class="emprestimo-actions">
                <button class="btn-devolver" onclick="registrarDevolucao('${emprestimo.matricula}', '${emprestimo.livro_id}')">
                    <i class="ph-duotone ph-check-circle"></i> Devolver
                </button>
                <button class="btn-extender" onclick="extenderPrazo('${emprestimo.matricula}', '${emprestimo.livro_id}')">
                    <i class="ph-duotone ph-clock-countdown"></i> Extender
                </button>
            </div>
        `;

        listaEmprestimos.appendChild(li);
    });

    // Adiciona evento de pesquisa
    document.getElementById('searchDevolucao')?.addEventListener('input', filtrarEmprestimosDevolucao);
}



/////////////////////////////////////////////////////////////////////////////////////////////////////
// 7. FUNÇÕES DE MANIPULAÇÃO DE DADOS
/////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Atualiza o status dos empréstimos (ativo, atrasado, devolvido)
 */
function atualizarStatusEmprestimos() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    lista_emprestimos.forEach(emprestimo => {
        if (emprestimo.status === 'devolvido') return;

        const dataDevolucao = parseData(emprestimo.dataDevolucao);
        
        if (emprestimo.dataDevolvido) {
            emprestimo.status = 'devolvido';
        } else if (hoje > dataDevolucao) {
            emprestimo.status = 'atrasado';
            // Calcula multa (R$ 1 por dia de atraso)
            const diasAtraso = Math.floor((hoje - dataDevolucao) / (1000 * 60 * 60 * 24));
            emprestimo.multa = diasAtraso * 1;
        } else {
            emprestimo.status = 'ativo';
        }
    });

    salvarEmprestimos();
}

/**
 * Registra a devolução de um livro
 */
async function registrarDevolucao(matricula, livroId) {
    try {
        const confirmado = await window.electronAPI.confirmarAcao(
            'Confirmar Devolução',
            'Deseja registrar a devolução deste livro?',
            'Esta ação não pode ser desfeita.'
        );

        if (confirmado) {
            const emprestimo = lista_emprestimos.find(e => 
                e.matricula === matricula && 
                e.livro_id === livroId && 
                (e.status === 'ativo' || e.status === 'atrasado')
            );

            if (!emprestimo) {
                await window.electronAPI.showErrorDialog('Erro', 'Empréstimo não encontrado!');
                return;
            }

            const hoje = formatarData(new Date());
            emprestimo.dataDevolvido = hoje;
            emprestimo.status = 'devolvido';
            
            // Atualizar disponibilidade do livro
            const livro = lista_livros.find(l => l.id_livro === livroId);
            if (livro) {
                livro.disponibilidade = "Disponível";
                localStorage.setItem('livros', JSON.stringify(lista_livros));
            }

            salvarEmprestimos();
            carregarEmprestimosParaDevolucao();
            
            await window.electronAPI.showMessageDialog(
                'Sucesso', 
                `Livro "${emprestimo.livro}" devolvido com sucesso!`
            );
        }
    } catch (error) {
        console.error('Erro ao registrar devolução:', error);
        window.electronAPI.showErrorDialog('Erro', 'Ocorreu um erro ao registrar a devolução.');
    }
}


/**
 * Estende o prazo de um empréstimo
 */
async function extenderPrazo(matricula, livroId) {
    try {
        const confirmado = await window.electronAPI.confirmarAcao(
            'Extender Prazo',
            'Deseja extender o prazo de devolução para daqui a 14 dias a partir de hoje?',
            'O novo prazo será calculado a partir da data atual.'
        );

        if (confirmado) {
            const emprestimo = lista_emprestimos.find(e => 
                e.matricula === matricula && 
                e.livro_id === livroId && 
                (e.status === 'ativo' || e.status === 'atrasado')
            );

            if (!emprestimo) {
                await window.electronAPI.showErrorDialog('Erro', 'Só é possível extender empréstimos ativos ou atrasados!');
                return;
            }

            // Calcula nova data (14 dias a partir de hoje)
            const novaDataDevolucao = new Date(); // Data atual
            novaDataDevolucao.setDate(novaDataDevolucao.getDate() + 14); // Adiciona 14 dias
            emprestimo.dataDevolucao = formatarData(novaDataDevolucao);

            // Se estava atrasado, atualiza status e remove multa
            if (emprestimo.status === 'atrasado') {
                emprestimo.status = 'ativo';
                emprestimo.multa = 0;
            }

            salvarEmprestimos();
            carregarEmprestimosParaDevolucao();
            
            await window.electronAPI.showMessageDialog(
                'Sucesso', 
                `Novo prazo de devolução: ${emprestimo.dataDevolucao}`
            );
        }
    } catch (error) {
        console.error('Erro ao extender prazo:', error);
        window.electronAPI.showErrorDialog('Erro', 'Ocorreu um erro ao extender o prazo.');
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////
// 8. FUNÇÕES DE FILTRO E BUSCA
/////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Filtra a lista de empréstimos
 */
function filtrarEmprestimos() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const todosEmprestimos = document.getElementById('todos-emprestimos');
    const cards = todosEmprestimos.getElementsByClassName('emprestimo-card');
    
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const usuario = card.querySelector('.emprestimo-header strong').textContent.toLowerCase();
        const livro = card.querySelector('.livro').textContent.toLowerCase();
        
        if (usuario.includes(searchInput) || livro.includes(searchInput)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    }
}


/**
 * Filtra a lista de empréstimos atrasados
 */
function filtrarEmprestimosAtrasados() {
    const searchInputo = document.getElementById('searchInputo').value.toLowerCase();
    const emprestimosAtrasados = document.getElementById('emprestimos-atrasados-lista');
    
    if (!emprestimosAtrasados) {
        console.error('Elemento "emprestimos-atrasados-lista" não encontrado');
        return;
    }
    
    const cards = emprestimosAtrasados.getElementsByClassName('emprestimo-card');
    
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const usuario = card.querySelector('.emprestimo-header strong')?.textContent.toLowerCase() || '';
        const livro = card.querySelector('.livro')?.textContent.toLowerCase() || '';
        
        if (usuario.includes(searchInputo) || livro.includes(searchInputo)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    }
}

/**
 * Filtra a lista de usuários
 */
function filtrarUsuarios() {
    const termo = document.getElementById('searchUsuario').value.toLowerCase();
    const lista = document.getElementById('lista-usuarios');
    lista.innerHTML = '';

    lista_usuarios
      .filter(usuario => usuario.nome.toLowerCase().includes(termo) || usuario.matricula.includes(termo)) // Filtra pelo nome ou matrícula
      .forEach(usuario => {
        const li = document.createElement('li');
        const icon = document.createElement('i');
        icon.classList.add('ph-duotone', 'ph-identification-card');
        li.appendChild(icon);
        li.appendChild(document.createTextNode(` ${usuario.matricula} - ${usuario.nome}`));
        li.onclick = () => mostrarDetalhes(usuario);
        lista.appendChild(li);
      });
}

/**
 * Filtra a lista de livros
 */
function filtrarLivros() {
    const termo = document.getElementById('searchLivro').value.toLowerCase();
    const lista = document.getElementById('lista-livros');
    lista.innerHTML = '';

    lista_livros
      .filter(livro => livro.titulo.toLowerCase().includes(termo) || livro.id_livro.includes(termo)) // Corrigido para usar lista_livros
      .forEach(livro => {
        const li = document.createElement('li');
        const icon = document.createElement('i');
        icon.classList.add('ph-duotone', 'ph-book');
        li.appendChild(icon);
        li.appendChild(document.createTextNode(` ${livro.id_livro} - ${livro.titulo}`));
        li.onclick = () => mostrarDetalhesLivro(livro);
        lista.appendChild(li);
      });
}

/**
 * Filtra empréstimos na tela de devolução
 */
function filtrarEmprestimosDevolucao() {
    const termo = document.getElementById('searchDevolucao').value.toLowerCase();
    const itens = document.querySelectorAll('#lista-emprestimos-ativos .emprestimo-item');

    itens.forEach(item => {
        const texto = item.textContent.toLowerCase();
        item.style.display = texto.includes(termo) ? '' : 'none';
    });
}


/////////////////////////////////////////////////////////////////////////////////////////////////////
// 9. FUNÇÕES AUXILIARES
/////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Obtém um parâmetro da URL
 */
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

/**
 * Redireciona para uma URL
 */
function goTo(url) {
    window.location.href = url;
    carregarEstatisticas();
}


/**
 * Formata uma data no formato DD/MM/AAAA
 */
function formatarData(data) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

/**
 * Converte uma string de data no formato DD/MM/AAAA para objeto Date
 */
function parseData(dataStr) {
    const [dia, mes, ano] = dataStr.split('/');
    return new Date(ano, mes - 1, dia);
}

/**
 * Salva os empréstimos no localStorage
 */
function salvarEmprestimos() {
    localStorage.setItem('emprestimos', JSON.stringify(lista_emprestimos));
}

/**
 * Conta livros por categoria para exibição de estatísticas
 */
function contarLivrosPorCategoria() {
    const contagem = {};
    lista_livros.forEach(livro => {
        if (!contagem[livro.id_categoria]) {
            contagem[livro.id_categoria] = 0;
        }
        contagem[livro.id_categoria]++;
    });
    return contagem;
}

/**
 * Preenche o select de usuários no formulário de empréstimo
 */
function preencherSelectUsuarios() {
    const selectUsuario = document.getElementById('select-usuario');

    lista_usuarios.forEach(usuario => {
        const option = document.createElement('option');
        option.value = usuario.matricula;
        option.textContent = `${usuario.nome} - ${usuario.matricula}`;
        selectUsuario.appendChild(option);
    });
}


/**
 * Preenche o select de livros disponíveis no formulário de empréstimo
 */
function preencherSelectLivros() {
    const selectLivro = document.getElementById('select-livro');

    lista_livros.forEach(livro => {
        if (livro.disponibilidade === "Disponível") {
            const option = document.createElement('option');
            option.value = livro.id_livro;
            option.textContent = `${livro.titulo} (${livro.id_livro})`;
            selectLivro.appendChild(option);
        }
    });
}


/////////////////////////////////////////////////////////////////////////////////////////////////////
// 10. FUNÇÕES DE EXIBIÇÃO DE DETALHES
/////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Mostra detalhes de um usuário
 */
function mostrarDetalhes(usuario) {
    document.getElementById('det-matricula').textContent = usuario.matricula;
    document.getElementById('det-nome').textContent = usuario.nome;
    document.getElementById('det-curso').textContent = usuario.curso;
    document.getElementById('det-telefone').textContent = usuario.telefone;
    document.getElementById('det-email').textContent = usuario.email;
}

/**
 * Mostra detalhes de um livro
 */
function mostrarDetalhesLivro(livro) {
    document.getElementById('det-id_livro').textContent = livro.id_livro;
    document.getElementById('det-titulo').textContent = livro.titulo;
    document.getElementById('det-autor').textContent = livro.autor;
    document.getElementById('det-isbn').textContent = livro.isbn;
    document.getElementById('det-ano_publicado').textContent = livro.ano_publicado;
    
    // Mostra o nome da categoria ao invés do ID
    const nomeCategoria = categoriasMap[livro.id_categoria] || 'Categoria Desconhecida';
    document.getElementById('det-id_categoria').textContent = nomeCategoria;
    
    document.getElementById('det-disponibilidade').textContent = livro.disponibilidade;
    
    // Mostra a quantidade de livros nesta categoria
    const contagem = contarLivrosPorCategoria();
    const quantidade = contagem[livro.id_categoria] || 0;
    document.getElementById('det-quantidade').textContent = `Quantidade na categoria: ${quantidade}`;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
// 11. FUNÇÕES DE ESTATÍSTICAS E DASHBOARD
/////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Carrega e exibe as estatísticas do dashboard
 */
function carregarEstatisticas() {

    const statsContainer = document.getElementById('total-livros');
    if (!statsContainer) return; // Sai se não estiver na página certa

    // Calcula estatísticas reais
    const stats = {
        "total-livros": lista_livros.length,
        "total-usuarios": lista_usuarios.length,
        "emprestimos-ativos": lista_emprestimos.filter(e => e.status === 'ativo').length,
        "emprestimos-atrasados": lista_emprestimos.filter(e => e.status === 'atrasado').length,
    };

    // Atualiza os elementos HTML com os valores reais
    for (const [id, value] of Object.entries(stats)) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    // Mapeamento de IDs de categoria para elementos HTML
    const categoriasElements = {
        '1': 'cat-fisica',
        '2': 'cat-quimica',
        '3': 'cat-biologia',
        '4': 'cat-matematica',
        '5': 'cat-literatura',
        '6': 'cat-portugues',
        '7': 'cat-ingles',
        '8': 'cat-geografia',
        '9': 'cat-historia',
        '10': 'cat-filosofia',
        '11': 'cat-sociologia',
        '12': 'cat-tecnologia',
        '13': 'cat-tecnicos',
        '14': 'cat-revistas',
        '15': 'cat-projetovida',
        '16': 'cat-educacaofisica',
        '17': 'cat-artes'
    };

    // Zera todas as categorias primeiro
    for (const id in categoriasElements) {
        const el = document.getElementById(categoriasElements[id]);
        if (el) el.textContent = '0';
    }

    // Conta livros por categoria
    lista_livros.forEach(livro => {
        const categoriaElement = categoriasElements[livro.id_categoria];
        if (categoriaElement) {
            const el = document.getElementById(categoriaElement);
            if (el) {
                const currentValue = parseInt(el.textContent) || 0;
                el.textContent = currentValue + 1;
            }
        }
    });
}



/////////////////////////////////////////////////////////////////////////////////////////////////////
// 12. FUNÇÕES DE GERENCIAMENTO DE SEÇÕES
/////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Esconde todas as seções principais
 */
function hideAllSections() {
    // Seções de consulta
    const emprestimos = document.getElementById("emprestimos-main");
    const usuarios = document.getElementById("usuarios-main");
    const livros = document.getElementById("livros-main");
    
    // Seções de operação
    const emprestar = document.getElementById("emprestar-main");
    const devolver = document.getElementById("devolver-main");
    
    // Seções de cadastro
    const usuario = document.getElementById("usuario-main");
    const livro = document.getElementById("livro-main");
    const bibliotecario = document.getElementById("bibliotecario-main");

    // Esconde todas as seções
    if (emprestimos) emprestimos.style.display = "none";
    if (usuarios) usuarios.style.display = "none";
    if (livros) livros.style.display = "none";
    if (emprestar) emprestar.style.display = "none";
    if (devolver) devolver.style.display = "none";
    if (usuario) usuario.style.display = "none";
    if (livro) livro.style.display = "none";
    if (bibliotecario) bibliotecario.style.display = "none";
}

/**
 * Mostra a seção apropriada baseada no tipo
 */
function showSectionByType(tipo) {
    // Primeiro escondemos todas as seções
    hideAllSections();
    
    // Depois mostramos apenas a seção correspondente ao tipo
    switch(tipo) {
        case "emprestimos":
            document.getElementById("emprestimos-main").style.display = "flex";
            break;
        case "usuarios":
            document.getElementById("usuarios-main").style.display = "flex";
            break;
        case "livros":
            document.getElementById("livros-main").style.display = "flex";
            break;
        case "emprestar":
            document.getElementById("emprestar-main").style.display = "flex";
            preencherSelectLivros();
            preencherSelectUsuarios();
            break;
        case "devolver":
            document.getElementById("devolver-main").style.display = "flex";
            break;
        case "usuario":
            document.getElementById("usuario-main").style.display = "flex";
            break;
        case "livro":
            document.getElementById("livro-main").style.display = "flex";
            break;
        case "bibliotecario":
            document.getElementById("bibliotecario-main").style.display = "flex";
            break;
        default:
            // Nenhuma seção específica para mostrar (página inicial)
            break;
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////
// 13. de atualizar e apagar
/////////////////////////////////////////////////////////////////////////////////////////////////////

function atualizarEstadoBotaoLivro() {
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.disabled = !livroForm.checkValidity();
    }
}

function atualizarEstadoBotao() {
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.disabled = !userForm.checkValidity();
    }
}

function atualizarEstadoBotaoBibliotecario() {
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.disabled = !bibliotecarioForm.checkValidity();
    }
}

function apagarUsuario(index) {
    window.electronAPI.confirmarApagar().then(confirmado => {
        if (confirmado) {
            lista_usuarios.splice(index, 1);
            localStorage.setItem('usuarios', JSON.stringify(lista_usuarios));
            carregarUsuarios();
        }
    }).catch(error => {
        console.error('Erro ao confirmar a exclusão:', error);
    });
}

function apagarLivro(index) {
    window.electronAPI.confirmarApagar().then(confirmado => {
        if (confirmado) {
            lista_livros.splice(index, 1);
            localStorage.setItem('livros', JSON.stringify(lista_livros));
            carregarLivros();
        }
    }).catch(error => {
        console.error('Erro ao confirmar a exclusão:', error);
    });
}

function apagarBibliotecario(index) {
    // Chama o IPC para perguntar se o usuário quer realmente apagar
    window.electronAPI.confirmarApagar().then(confirmado => {
        if (confirmado) {
            bibliotecarios.splice(index, 1); // Remove o bibliotecário
            localStorage.setItem('bibliotecarios', JSON.stringify(bibliotecarios)); // Atualiza o localStorage
            carregarBibliotecarios(); // Atualiza a interface
        }
    }).catch(error => {
        console.error('Erro ao confirmar a exclusão:', error);
    });
}