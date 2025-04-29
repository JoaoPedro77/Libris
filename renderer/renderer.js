/////////////////////////////////////////////////////////////////////////////////////////////////////
// 1. CONSTANTES E VARIÁVEIS GLOBAIS 🛵
/////////////////////////////////////////////////////////////////////////////////////////////////////

/* 
 * Variáveis globais que armazenam os dados da aplicação.
 * Inicializadas com dados do localStorage ou valores padrão.
 */

// Lista de empréstimos
let lista_emprestimos

// Lista de usuários
let lista_usuarios 

// Lista de livros
let lista_livros 

// Lista de bibliotecários
let bibliotecarios 


// Mapeamento de categorias de livros
let categoriasMap


// Funções auxiliares para operações no banco de dados
async function carregarDadosDoBanco() {

    

    try {

        

        // Carrega dados do banco
        const emprestimosDB = await window.electronAPI.getEmprestimos();
        const usuariosDB = await window.electronAPI.getUsuarios();
        const livrosDB = await window.electronAPI.getLivros();
        const bibliotecariosDB = await window.electronAPI.getBibliotecarios();
        const categoriasMapBD = await window.electronAPI.getCategorias();


        // Converte os dados para o formato esperado pelo frontend
        lista_emprestimos = emprestimosDB.map(e => ({
            ...e,
            dataEmprestimo: formatarData(new Date(e.dataEmprestimo)),
            dataDevolucao: formatarData(new Date(e.dataDevolucao)),
            dataDevolvido: e.dataDevolvido ? formatarData(new Date(e.dataDevolvido)) : null
        }));

        lista_usuarios = usuariosDB;
        lista_livros = livrosDB;
        bibliotecarios = bibliotecariosDB;
        categoriasMap = categoriasMapBD;

    } catch (error) {
        console.error('Erro ao carregar dados do banco:', error);
        // Inicializa com arrays vazios em caso de erro
        lista_emprestimos = [];
        lista_usuarios = [];
        lista_livros = [];
        bibliotecarios = [];
        categoriasMap = [];
    }
}

async function salvarEmprestimo(emprestimo) {
    // Converte as datas para o formato do banco
    const emprestimoParaBanco = {
        ...emprestimo,
        dataEmprestimo: parseData(emprestimo.dataEmprestimo).toISOString().split('T')[0],
        dataDevolucao: parseData(emprestimo.dataDevolucao).toISOString().split('T')[0]
    };
    return await window.electronAPI.addEmprestimo(emprestimoParaBanco);
}

async function salvarUsuario(usuario) {
    return await window.electronAPI.addUsuario(usuario);
}

async function salvarLivro(livro) {
    return await window.electronAPI.addLivro(livro);
}

async function salvarBibliotecario(bibliotecario) {
    return await window.electronAPI.addBibliotecario(bibliotecario);
}

async function atualizarLivro(id, dados) {
    return await window.electronAPI.updateLivro(id, dados);
}

async function deletarUsuario(matricula) {
    return await window.electronAPI.deleteUsuario(matricula);
}

async function deletarLivro(id) {
    return await window.electronAPI.deleteLivro(id);
}

async function deletarBibliotecario(matricula) {
    return await window.electronAPI.deleteBibliotecario(matricula);
}

async function registrarDevolucaoNoBanco(idEmprestimo) {
    return await window.electronAPI.registrarDevolucao(idEmprestimo);
}



/////////////////////////////////////////////////////////////////////////////////////////////////////
// 2. FUNÇÕES DE INICIALIZAÇÃO E CONTROLE DA APLICAÇÃO
/////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Evento principal que é disparado quando o DOM está totalmente carregado
 * Configura toda a aplicação, carrega dados e define os listeners
 */

document.addEventListener("DOMContentLoaded", async () => {
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
    await carregarDadosIniciais();
    
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
async function carregarDadosIniciais() {
    await carregarDadosDoBanco();
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
            ).then(async (confirmado) => {
                if (confirmado) {
                    try {
                        // Salva no banco de dados
                        await salvarEmprestimo(novoEmprestimo);
                        
                        // Atualiza status do livro no banco
                        await atualizarLivro(livro.id_livro, { disponibilidade: "Indisponível" });
                        
                        // Atualiza a lista local
                        lista_emprestimos.push(novoEmprestimo);
                        livro.disponibilidade = "Indisponível";
                        
                        window.electronAPI.showMessageDialog(
                            'Sucesso', 
                            `Empréstimo registrado para ${usuario.nome}!`
                        );
                        
                        goTo("index.html");
                    } catch (error) {
                        console.error('Erro ao salvar empréstimo:', error);
                        window.electronAPI.showErrorDialog(
                            'Erro', 
                            'Ocorreu um erro ao registrar o empréstimo.'
                        );
                    }
                }
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
        const idLivroInput = document.getElementById("id_livro");
        if (idLivroInput) {
            idLivroInput.addEventListener('input', () => validarIdLivro(idLivroInput));
            idLivroInput.addEventListener('change', () => validarIdLivro(idLivroInput));
        }
        livroForm.addEventListener("submit", async function(e) {
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
                disponibilidade: "Disponível"
            };
    
            try {
                await salvarLivro(livroData);
                lista_livros.push(livroData);
                goTo("index.html");
            } catch (error) {
                console.error('Erro ao salvar livro:', error);
                window.electronAPI.showErrorDialog('Erro', 'Não foi possível cadastrar o livro.');
            }
        });
    }
}

/**
 * Configura o formulário de usuário
 */
function setupUsuarioForm() {
    const userForm = document.querySelector(".user-form");
    if (userForm) {
        const matriculaInput = document.getElementById("matricula");
        if (matriculaInput) {
            matriculaInput.addEventListener('input', () => validarMatricula(matriculaInput));
            matriculaInput.addEventListener('change', () => validarMatricula(matriculaInput));
        }
        userForm.addEventListener("submit", async function(e) {
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
            
            try {
                await salvarUsuario(userData);
                lista_usuarios.push(userData);
                goTo("index.html");
            } catch (error) {
                console.error('Erro ao salvar usuário:', error);
                window.electronAPI.showErrorDialog('Erro', 'Não foi possível cadastrar o usuário.');
            }
        });
    }
}

/**
 * Configura o formulário de bibliotecário
 */
function setupBibliotecarioForm() {
    const bibliotecarioForm = document.querySelector(".bibliotecario-form");
    if (bibliotecarioForm) {
        bibliotecarioForm.addEventListener("submit", async function(e) {
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
            
            try {
                await salvarBibliotecario(userData);
                bibliotecarios.push(userData);
                goTo("index.html");
            } catch (error) {
                console.error('Erro ao salvar bibliotecário:', error);
                window.electronAPI.showErrorDialog('Erro', 'Não foi possível cadastrar o bibliotecário.');
            }
        });
    }
}

/**
 * Configura o formulário de login
 */
function setupLoginForm() {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            
            const login = document.getElementById("login").value;
            const senha = document.getElementById("senha").value;
            const errorMsg = document.getElementById("login-error");

            if (!login || !senha) {
                errorMsg.textContent = "Por favor, preencha todos os campos.";
                errorMsg.style.display = "block";
                return;
            }

            try {
                const usuarioValido = await window.electronAPI.login({ login, senha });
                
                if (usuarioValido) {
                    window.localStorage.setItem('loggedIn', true);
                    goTo("index.html");
                } else {
                    errorMsg.textContent = "Login ou senha inválidos.";
                    errorMsg.style.display = "block";
                }
            } catch (error) {
                console.error('Erro no login:', error);
                errorMsg.textContent = "Erro ao tentar fazer login.";
                errorMsg.style.display = "block";
            }
        });
    } 
}


/////////////////////////////////////////////////////////////////////////////////////////////////////
// 5. FUNÇÕES DE VALIDAÇÃO
/////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Valida se uma matrícula já existe
 */
async function validarMatricula(input) {
    const matricula = input.value.trim();
    const submitBtn = document.getElementById('submit-btn');
    
    // Limpa a validação sempre que começar
    input.setCustomValidity("");
    
    if (!matricula) {
        if (submitBtn) submitBtn.disabled = true;
        return true;
    }

    try {
        const usuarioExistente = await window.electronAPI.getUsuarioByMatricula(matricula);
        
        if (usuarioExistente) {
            input.setCustomValidity("Matrícula já cadastrada!");
            input.reportValidity();
            if (submitBtn) submitBtn.disabled = true;
            return false;
        } else {
            input.setCustomValidity("");
            if (submitBtn) submitBtn.disabled = !input.closest('form').checkValidity();
            return true;
        }
    } catch (error) {
        console.error('Erro ao validar matrícula:', error);
        input.setCustomValidity("Erro ao verificar matrícula");
        input.reportValidity();
        if (submitBtn) submitBtn.disabled = true;
        return false;
    }
}


/**
 * Valida se um ID de livro já existe
 */
async function validarIdLivro(input) {
    const idLivro = input.value.trim();
    const submitBtn = document.getElementById('submit-btn');
    
    // Limpa a validação sempre que começar
    input.setCustomValidity("");
    
    if (!idLivro) {
        if (submitBtn) submitBtn.disabled = true;
        return true;
    }

    try {
        const livroExistente = await window.electronAPI.getLivroById(idLivro);
        
        if (livroExistente) {
            input.setCustomValidity("ID do livro já cadastrado!");
            input.reportValidity();
            if (submitBtn) submitBtn.disabled = true;
            return false;
        } else {
            input.setCustomValidity("");
            if (submitBtn) submitBtn.disabled = !input.closest('form').checkValidity();
            return true;
        }
    } catch (error) {
        console.error('Erro ao validar ID do livro:', error);
        input.setCustomValidity("Erro ao verificar ID");
        input.reportValidity();
        if (submitBtn) submitBtn.disabled = true;
        return false;
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
async function carregarEmprestimosParaDevolucao() {
    const listaEmprestimos = document.getElementById('lista-emprestimos-ativos');
    if (!listaEmprestimos) return;

    await carregarDadosDoBanco();
    listaEmprestimos.innerHTML = '';

    const emprestimosAtivos = lista_emprestimos.filter(e => 
        e.status === 'ativo' || e.status === 'atrasado'
    );

    if (emprestimosAtivos.length === 0) {
        listaEmprestimos.innerHTML = '<p class="placeholder-text">Nenhum empréstimo ativo no momento.</p>';
        return;
    }

    emprestimosAtivos.forEach(emprestimo => {
        const li = document.createElement('li');
        li.className = 'emprestimo-item';
        li.setAttribute('data-id', emprestimo.id);
        
        // Destaque para empréstimos atrasados
        const atrasadoClass = emprestimo.status === 'atrasado' ? 'emprestimo-atrasado' : '';
        
        li.innerHTML = `
            <div class="emprestimo-info ${atrasadoClass}">
                <h3><i class="ph-duotone ph-user"></i> ${emprestimo.usuario}</h3>
                <p><i class="ph-duotone ph-identification-card"></i> Matrícula: ${emprestimo.matricula}</p>
                <p><i class="ph-duotone ph-book"></i> Livro: ${emprestimo.livro} (ID: ${emprestimo.livro_id})</p>
                <div class="data-info">
                    <span><i class="ph-duotone ph-calendar-blank"></i> Empréstimo: ${emprestimo.dataEmprestimo}</span>
                    <span><i class="ph-duotone ph-calendar-check"></i> Devolução: ${emprestimo.dataDevolucao}</span>
                </div>
                ${emprestimo.status === 'atrasado' ? `
                <div class="multa-info">
                    <i class="ph-duotone ph-warning"></i>
                    <span>Multa acumulada: R$ ${emprestimo.multa.toFixed(2)}</span>
                    <small>(${Math.floor(emprestimo.multa)} dias de atraso)</small>
                </div>
                ` : ''}
            </div>
            <div class="emprestimo-actions">
                <button class="btn-devolver" data-id="${emprestimo.id}">
                    <i class="ph-duotone ph-check-circle"></i> Devolver
                </button>
                <button class="btn-extender" data-id="${emprestimo.id}">
                    <i class="ph-duotone ph-clock-countdown"></i> Extender
                </button>
            </div>
        `;

        listaEmprestimos.appendChild(li);
    });

    // Adiciona os event listeners
    document.querySelectorAll('.btn-devolver').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            await registrarDevolucao(id);
        });
    });

    document.querySelectorAll('.btn-extender').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            await extenderPrazo(id);
        });
    });
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
async function registrarDevolucao(idEmprestimo) {
    try {
        const confirmado = await window.electronAPI.confirmarAcao(
            'Confirmar Devolução',
            'Deseja registrar a devolução deste livro?',
            'Esta ação não pode ser desfeita.'
        );

        if (confirmado) {
            // Registra a devolução no banco
            await registrarDevolucaoNoBanco(idEmprestimo);
            
            // Atualiza localmente
            const emprestimoIndex = lista_emprestimos.findIndex(e => e.id === idEmprestimo);
            if (emprestimoIndex !== -1) {
                const hoje = formatarData(new Date());
                lista_emprestimos[emprestimoIndex].dataDevolvido = hoje;
                lista_emprestimos[emprestimoIndex].status = 'devolvido';
                
                // Atualiza disponibilidade do livro
                const livroId = lista_emprestimos[emprestimoIndex].livro_id;
                const livroIndex = lista_livros.findIndex(l => l.id_livro === livroId);
                if (livroIndex !== -1) {
                    lista_livros[livroIndex].disponibilidade = "Disponível";
                    await atualizarLivro(livroId, { disponibilidade: "Disponível" });
                }
            }

            // Recarrega as listas necessárias
            await carregarDadosDoBanco(); // Recarrega os dados do banco
            carregarEmprestimosParaDevolucao(); // Atualiza a lista de devolução
            carregarEmprestimos(); // Atualiza a lista geral de empréstimos
            carregarLivros(); // Atualiza a lista de livros
            
            await window.electronAPI.showMessageDialog(
                'Sucesso', 
                'Livro devolvido com sucesso!'
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
async function extenderPrazo(idEmprestimo) {
    try {
        const confirmado = await window.electronAPI.confirmarAcao(
            'Extender Prazo',
            'Deseja extender o prazo de devolução para daqui a 14 dias a partir de hoje?',
            'O novo prazo será calculado a partir da data atual.'
        );

        if (confirmado) {
            // Encontra o empréstimo na lista local para verificar se existe
            const emprestimo = lista_emprestimos.find(e => e.id == idEmprestimo);
            
            if (!emprestimo) {
                await window.electronAPI.showErrorDialog('Erro', 'Empréstimo não encontrado na lista local!');
                return;
            }

            // Calcula nova data (14 dias a partir de hoje)
            const novaDataDevolucao = new Date();
            novaDataDevolucao.setDate(novaDataDevolucao.getDate() + 14);
            const novaDataStr = novaDataDevolucao.toISOString().split('T')[0];
            
            // DEBUG: Mostra os valores que serão enviados
            console.log('ID a ser enviado:', idEmprestimo, 'Tipo:', typeof idEmprestimo);
            console.log('Nova data:', novaDataStr);
            
            // Atualiza no banco de dados
            const resultado = await window.electronAPI.extenderPrazoEmprestimo(idEmprestimo, novaDataStr);
            
            // Verifica se a operação no banco foi bem sucedida
            if (!resultado.success) {
                throw new Error(resultado.error || 'Falha ao extender prazo no banco de dados');
            }

            // Atualiza localmente
            emprestimo.dataDevolucao = formatarData(novaDataDevolucao);
            if (emprestimo.status === 'atrasado') {
                emprestimo.status = 'ativo';
                emprestimo.multa = 0;
            }

            // Recarrega os dados do banco para garantir sincronização
            await carregarDadosDoBanco();
            
            await window.electronAPI.showMessageDialog(
                'Sucesso', 
                `Novo prazo de devolução: ${formatarData(novaDataDevolucao)}`
            );
            
            // Atualiza as listas
            carregarEmprestimosParaDevolucao();
            carregarEmprestimos();
        }
    } catch (error) {
        console.error('Erro ao extender prazo:', error);
        window.electronAPI.showErrorDialog('Erro', error.message || 'Ocorreu um erro ao extender o prazo.');
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
async function preencherSelectUsuarios() {
    const selectUsuario = document.getElementById('select-usuario');
    if (!selectUsuario) return;

    // Verifica se já foi preenchido
    if (selectUsuario.options.length > 1) return;

    // Limpa o select
    selectUsuario.innerHTML = '';
    
    // Opção padrão
    const optionPadrao = document.createElement('option');
    optionPadrao.value = '';
    optionPadrao.textContent = 'Selecione um usuário';
    optionPadrao.selected = true;
    optionPadrao.disabled = true;
    selectUsuario.appendChild(optionPadrao);

    // Carrega usuários do banco se necessário
    if (!lista_usuarios || lista_usuarios.length === 0) {
        await carregarDadosDoBanco();
    }

    // Preenche as opções
    lista_usuarios.forEach(usuario => {
        const option = document.createElement('option');
        option.value = usuario.matricula;
        option.textContent = `${usuario.nome} (${usuario.matricula})`;
        selectUsuario.appendChild(option);
    });
}

async function preencherSelectLivros() {
    const selectLivro = document.getElementById('select-livro');
    if (!selectLivro) return;

    // Verifica se já foi preenchido
    if (selectLivro.options.length > 1) return;

    // Limpa o select
    selectLivro.innerHTML = '';
    
    // Opção padrão
    const optionPadrao = document.createElement('option');
    optionPadrao.value = '';
    optionPadrao.textContent = 'Selecione um livro';
    optionPadrao.selected = true;
    optionPadrao.disabled = true;
    selectLivro.appendChild(optionPadrao);

    // Carrega livros do banco se necessário
    if (!lista_livros || lista_livros.length === 0) {
        await carregarDadosDoBanco();
    }

    // Preenche apenas livros disponíveis
    lista_livros
        .filter(livro => livro.disponibilidade === "Disponível")
        .forEach(livro => {
            const option = document.createElement('option');
            option.value = livro.id_livro;
            option.textContent = `${livro.titulo} (${livro.id_livro})`;
            selectLivro.appendChild(option);
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
async function carregarEstatisticas() {
    // Certifique-se que os dados estão carregados
    if (!lista_livros || !lista_usuarios || !lista_emprestimos) {
        await carregarDadosDoBanco();
    }

    const statsContainer = document.getElementById('total-livros');
    if (!statsContainer) return;

    // Calcula estatísticas atualizadas
    const stats = {
        "total-livros": lista_livros.length,
        "total-usuarios": lista_usuarios.length,
        "emprestimos-ativos": lista_emprestimos.filter(e => e.status === 'ativo').length,
        "emprestimos-atrasados": lista_emprestimos.filter(e => e.status === 'atrasado').length,
    };

    // Atualiza os elementos HTML
    for (const [id, value] of Object.entries(stats)) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    // Mapeamento de categorias
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
    for (const elId of Object.values(categoriasElements)) {
        const el = document.getElementById(elId);
        if (el) el.textContent = '0';
    }

    // Conta livros por categoria
    const contagemCategorias = {};
    lista_livros.forEach(livro => {
        contagemCategorias[livro.id_categoria] = (contagemCategorias[livro.id_categoria] || 0) + 1;
    });

    // Atualiza as categorias
    for (const [categoriaId, elId] of Object.entries(categoriasElements)) {
        const el = document.getElementById(elId);
        if (el) {
            el.textContent = contagemCategorias[categoriaId] || '0';
        }
    }
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

async function apagarUsuario(index) {
    const usuario = lista_usuarios[index];
    window.electronAPI.confirmarApagar().then(async (confirmado) => {
        if (confirmado) {
            try {
                await deletarUsuario(usuario.matricula);
                lista_usuarios.splice(index, 1);
                carregarUsuarios();
            } catch (error) {
                console.error('Erro ao apagar usuário:', error);
                window.electronAPI.showErrorDialog('Erro', 'Não foi possível apagar o usuário.');
            }
        }
    });
}

async function apagarLivro(index) {
    const livro = lista_livros[index];
    window.electronAPI.confirmarApagar().then(async (confirmado) => {
        if (confirmado) {
            try {
                await deletarLivro(livro.id_livro);
                lista_livros.splice(index, 1);
                carregarLivros();
            } catch (error) {
                console.error('Erro ao apagar livro:', error);
                window.electronAPI.showErrorDialog('Erro', 'Não foi possível apagar o livro.');
            }
        }
    });
}

async function apagarBibliotecario(index) {
    const bibliotecario = bibliotecarios[index];
    window.electronAPI.confirmarApagar().then(async (confirmado) => {
        if (confirmado) {
            try {
                await deletarBibliotecario(bibliotecario.matricula);
                bibliotecarios.splice(index, 1);
                carregarBibliotecarios();
            } catch (error) {
                console.error('Erro ao apagar bibliotecário:', error);
                window.electronAPI.showErrorDialog('Erro', 'Não foi possível apagar o bibliotecário.');
            }
        }
    });
}