const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld('fileManager', {
    open: () => ipcRenderer.invoke('dialog:open'),

    read: (path) => ipcRenderer.invoke('fs:read', path),

    write: (path, content) => ipcRenderer.invoke('fs:write', path, content)
})

contextBridge.exposeInMainWorld('compiler', {
    compile: (path) => ipcRenderer.invoke('compiler:compile', path),
//    onMessage: (callback) => ipcRenderer.on('compiler:on-message', callback),
//    onError: (callback) => ipcRenderer.on('compiler:on-error', callback)
});



