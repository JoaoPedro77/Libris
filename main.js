const { app, BrowserWindow, ipcMain, dialog  } = require('electron');
const mysql = require('mysql2/promise');
const path = require('path');

const dbConfig = {
  host: 'localhost',      // ou seu endereço de servidor MySQL
  user: 'root',           // seu usuário MySQL
  password: 'root',           // sua senha MySQL
  database: 'biblioteca'  // nome do banco de dados
};

async function createConnection() {
  return await mysql.createConnection(dbConfig);
}


function createWindow () {
  const win = new BrowserWindow({
    width: 1000,
    height: 600,
    frame: false, // sem moldura do sistema
    fullscreen: false,
    fullscreenable: false,
    resizable:false,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: false,
    }
  });
  win.setMenu(null);
  win.loadFile('renderer/login.html');

  // Eventos de minimizar e fechar
  ipcMain.on('minimize-window', () => {
    win.minimize();
  });

  ipcMain.on('close-window', () => {
    win.close();
  });

  ipcMain.on('drag-window', () => {
    const [x, y] = win.getPosition();
    win.setPosition(x, y); // Isso ativa o modo de arraste do Electron
  });

  ipcMain.handle('showMessage', async (event, options) => {
    return dialog.showMessageBox({
        type: options.type,
        title: options.title,
        message: options.message
    });
  });

  ipcMain.handle('show-message-dialog', async (event, options) => {
    return dialog.showMessageBox({
        type: 'info',
        title: options.title,
        message: options.message,
        buttons: ['OK']
    });
});


  // Para confirmações
  ipcMain.handle('confirmarAcao', async (event, options) => {
      const result = await dialog.showMessageBox({
          type: 'question',
          buttons: ['Sim', 'Não'],
          frame:false,
          title: options.title,
          message: options.message,
          detail: options.detail
          
      });
      return result.response === 0;
  });


  ipcMain.handle('show-error-dialog', async (event, { title, message }) => {
    return dialog.showMessageBox({
        type: 'error',
        title: title,
        message: message,
        buttons: ['OK']
    });
  });

  ipcMain.handle('confirmar-apagar', async () => {
    const options = {
      type: 'warning',
      buttons: ['Cancelar', 'Apagar'],
      defaultId: 0, // Cancelar como padrão (mais seguro)
      cancelId: 0,   // Fechar a janela equivale a Cancelar
      title: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja apagar este bibliotecário?',
      detail: 'Esta ação não pode ser desfeita.',
      icon: path.join(__dirname, 'assets', 'warning-icon.png'), // Adicione um ícone personalizado
      noLink: true // Evita o estilo de link nos botões (Windows)
    };
  
    try {
      const response = await dialog.showMessageBox(options);
      return response.response === 1; // Retorna true apenas se "Apagar" for clicado
    } catch (error) {
      console.error('Erro na caixa de diálogo:', error);
      return false; // Em caso de erro, assume cancelamento
    }
    
  });

}


//handels de banco de daodos:
ipcMain.handle('login', async (event, { login, senha }) => {
  const conn = await createConnection();
  try {
      const [rows] = await conn.query(
          'SELECT * FROM bibliotecarios WHERE login = ? AND senha = ?', 
          [login, senha]
      );
      return rows.length > 0 ? rows[0] : null;
  } finally {
      await conn.end();
  }
});

// Handlers de Livros
ipcMain.handle('get-livros', async () => {
  const conn = await createConnection();
  try {
      const [rows] = await conn.query('SELECT * FROM livros');
      return rows;
  } finally {
      await conn.end();
  }
});

ipcMain.handle('get-livro-by-id', async (event, id) => {
  const conn = await createConnection();
  try {
      const [rows] = await conn.query('SELECT * FROM livros WHERE id_livro = ?', [id]);
      return rows[0];
  } finally {
      await conn.end();
  }
});

ipcMain.handle('add-livro', async (event, livro) => {
  const conn = await createConnection();
  try {
      const [result] = await conn.query('INSERT INTO livros SET ?', livro);
      return result;
  } finally {
      await conn.end();
  }
});

// No arquivo main do Electron
ipcMain.handle('update-emprestimo', async (event, id, updates) => {
  try {
      const result = await db.run(
          `UPDATE emprestimos SET 
              status = ?, 
              multa = ?,
              dataDevolvido = ?
           WHERE id = ?`,
          [updates.status, updates.multa, updates.dataDevolvido, id]
      );
      return { success: true };
  } catch (error) {
      return { success: false, error: error.message };
  }
});

ipcMain.handle('update-livro', async (event, id, livro) => {
  const conn = await createConnection();
  try {
      const [result] = await conn.query('UPDATE livros SET ? WHERE id_livro = ?', [livro, id]);
      return result;
  } finally {
      await conn.end();
  }
});

ipcMain.handle('delete-livro', async (event, id) => {
  const conn = await createConnection();
  try {
      const [result] = await conn.query('DELETE FROM livros WHERE id_livro = ?', [id]);
      return result;
  } finally {
      await conn.end();
  }
});

ipcMain.handle('get-livros-disponiveis', async () => {
  const conn = await createConnection();
  try {
      const [rows] = await conn.query(
          'SELECT * FROM livros WHERE disponibilidade = "Disponível"'
      );
      return rows;
  } finally {
      await conn.end();
  }
});

// Handlers de Usuários
ipcMain.handle('get-usuarios', async () => {
  const conn = await createConnection();
  try {
      const [rows] = await conn.query('SELECT * FROM usuarios');
      return rows;
  } finally {
      await conn.end();
  }
});

ipcMain.handle('get-usuario-by-matricula', async (event, matricula) => {
  const conn = await createConnection();
  try {
      const [rows] = await conn.query('SELECT * FROM usuarios WHERE matricula = ?', [matricula]);
      return rows[0];
  } finally {
      await conn.end();
  }
});

ipcMain.handle('add-usuario', async (event, usuario) => {
  const conn = await createConnection();
  try {
      const [result] = await conn.query('INSERT INTO usuarios SET ?', usuario);
      return result;
  } finally {
      await conn.end();
  }
});


ipcMain.handle('update-usuario', async (event, matricula, usuario, senha) => {
  const conn = await createConnection();
  try {
      const [result] = await conn.query('UPDATE usuarios SET ? WHERE matricula = ?', [usuario, matricula, senha]);
      return result;
  } finally {
      await conn.end();
  }
});

ipcMain.handle('delete-usuario', async (event, matricula) => {
  const conn = await createConnection();
  try {
      const [result] = await conn.query('DELETE FROM usuarios WHERE matricula = ?', [matricula]);
      return result;
  } finally {
      await conn.end();
  }
});

// Handlers de Empréstimos
ipcMain.handle('get-emprestimos', async () => {
  const conn = await createConnection();
  try {
      const [rows] = await conn.query('SELECT * FROM emprestimos');
      return rows;
  } finally {
      await conn.end();
  }
});

ipcMain.handle('get-emprestimos-ativos', async () => {
  const conn = await createConnection();
  try {
      const [rows] = await conn.query(
          'SELECT * FROM emprestimos WHERE status IN ("ativo", "atrasado")'
      );
      return rows;
  } finally {
      await conn.end();
  }
});

ipcMain.handle('get-emprestimo-by-id', async (event, id) => {
  const conn = await createConnection();
  try {
      const [rows] = await conn.query('SELECT * FROM emprestimos WHERE id = ?', [id]);
      return rows[0];
  } finally {
      await conn.end();
  }
});

ipcMain.handle('add-emprestimo', async (event, emprestimo) => {
  const conn = await createConnection();
  try {
      // Converte as datas para o formato MySQL
      const emprestimoParaBanco = {
          ...emprestimo,
          dataEmprestimo: new Date(emprestimo.dataEmprestimo).toISOString().slice(0, 10),
          dataDevolucao: new Date(emprestimo.dataDevolucao).toISOString().slice(0, 10)
      };
      
      const [result] = await conn.query('INSERT INTO emprestimos SET ?', emprestimoParaBanco);
      
      // Atualiza o status do livro para "Indisponível"
      await conn.query('UPDATE livros SET disponibilidade = "Indisponível" WHERE id_livro = ?', 
                       [emprestimo.livro_id]);
      
      return result;
  } finally {
      await conn.end();
  }
});

ipcMain.handle('registrar-devolucao', async (event, id) => {
  const conn = await createConnection();
  try {
      // Obtém o empréstimo para pegar o livro_id
      const [emprestimo] = await conn.query('SELECT * FROM emprestimos WHERE id = ?', [id]);
      
      if (!emprestimo[0]) {
          throw new Error('Empréstimo não encontrado');
      }
      
      // Atualiza o empréstimo
      const [result] = await conn.query(
          'UPDATE emprestimos SET status = "devolvido", dataDevolvido = ? WHERE id = ?',
          [new Date().toISOString().slice(0, 10), id]
      );
      
      // Atualiza o livro para "Disponível"
      await conn.query(
          'UPDATE livros SET disponibilidade = "Disponível" WHERE id_livro = ?',
          [emprestimo[0].livro_id]
      );
      
      return result;
  } finally {
      await conn.end();
  }
});

ipcMain.handle('extenderPrazoEmprestimo', async (event, id, novaData) => {
  console.log('Recebido no backend - ID:', id, 'Tipo:', typeof id);
  console.log('Nova data:', novaData);
  
  const conn = await createConnection();
  try {
      const [result] = await conn.query(
          'UPDATE emprestimos SET dataDevolucao = ?, status = "ativo", multa = 0 WHERE id = ?',
          [novaData, id]
      );
      
      console.log('Resultado da query:', result);
      
      if (result.affectedRows === 0) {
          console.log('Nenhuma linha afetada - ID provavelmente não existe');
          return { success: false, error: 'Nenhum empréstimo encontrado com o ID fornecido' };
      }
      
      return { success: true, affectedRows: result.affectedRows };
  } catch (error) {
      console.error('Erro no handler:', error);
      return { success: false, error: error.message };
  } finally {
      await conn.end();
  }
});

// Handlers de Bibliotecários
ipcMain.handle('get-bibliotecarios', async () => {
  const conn = await createConnection();
  try {
      const [rows] = await conn.query('SELECT * FROM bibliotecarios');
      return rows;
  } finally {
      await conn.end();
  }
});

ipcMain.handle('get-bibliotecario-by-login', async (event, login) => {
  const conn = await createConnection();
  try {
      const [rows] = await conn.query('SELECT * FROM bibliotecarios WHERE login = ?', [login]);
      return rows[0];
  } finally {
      await conn.end();
  }
});

ipcMain.handle('add-bibliotecario', async (event, bibliotecario) => {
  const conn = await createConnection();
  try {
      const [result] = await conn.query('INSERT INTO bibliotecarios SET ?', bibliotecario);
      return result;
  } finally {
      await conn.end();
  }
});

ipcMain.handle('delete-bibliotecario', async (event, matricula) => {
  const conn = await createConnection();
  try {
      const [result] = await conn.query('DELETE FROM bibliotecarios WHERE matricula = ?', [matricula]);
      return result;
  } finally {
      await conn.end();
  }
});

// Handlers de Categorias
ipcMain.handle('get-categorias', async () => {
  const conn = await createConnection();
  try {
      const [rows] = await conn.query('SELECT * FROM categorias');
      // Transforma o array de categorias em um objeto de mapeamento
      const categoriasMap = {};
      rows.forEach(categoria => {
          categoriasMap[categoria.id_categoria] = categoria.nome;
      });
      return categoriasMap;
  } finally {
      await conn.end();
  }
});





app.whenReady().then(async () => {
  try {
      const conn = await createConnection();
      await conn.end();
      createWindow();
  } catch (error) {
      console.error('Falha ao conectar ao banco de dados:', error);
      dialog.showErrorBox('Erro de Banco de Dados', 'Não foi possível conectar ao banco de dados. Verifique se o MySQL está rodando.');
      app.quit();
  }
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

