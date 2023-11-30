const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld('fileManager', {
    open: () => ipcRenderer.invoke('dialog:open')
})

contextBridge.exposeInMainWorld('vm', {
    run: (filepath) => ipcRenderer.invoke('vm:run', filepath),
    input: (input) => ipcRenderer.invoke('vm:input', input),
    onInputRequest: (callback) => ipcRenderer.on('vm:on-input-request', callback),
    onData: (callback) => ipcRenderer.on('vm:on-data', callback),
    onError: (callback) => ipcRenderer.on('vm:on-error', callback)
});



