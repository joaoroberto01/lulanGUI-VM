const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld('fileManager', {
    open: () => ipcRenderer.invoke('dialog:open')
})

contextBridge.exposeInMainWorld('vm', {
    load: (filepath) => ipcRenderer.invoke('vm:load', filepath),
    run: () => ipcRenderer.invoke('vm:run'),
    stepRun: () => ipcRenderer.invoke('vm:step-run'),
    input: (value) => ipcRenderer.invoke('vm:input', value),
    onData: (callback) => ipcRenderer.on('vm:on-data', callback),
    onError: (callback) => ipcRenderer.on('vm:on-error', callback)
});



