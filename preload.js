const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    minimize: () => ipcRenderer.send('minimize-window'),
    close: () => ipcRenderer.send('close-window'),
    dragWindow: () => ipcRenderer.send('drag-window'),
    confirmarApagar: () => ipcRenderer.invoke('confirmar-apagar'),
    confirmarAcao: (title, message, detail) => ipcRenderer.invoke('confirmarAcao', {title, message, detail}),
    showMessageDialog: (title, message) => ipcRenderer.invoke('showMessage', {title, message}),
    showMessageDialogg: (title, message) => ipcRenderer.invoke('show-message-dialog', {title, message}),
    showErrorDialog: (title, message) => ipcRenderer.invoke('show-error-dialog', {title, message})
    
});