const { app, BrowserWindow, ipcMain, dialog  } = require('electron');
const path = require('path');

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

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

