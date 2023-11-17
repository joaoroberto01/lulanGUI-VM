document.onkeydown = (event) => {
    if (!controlOrCommand(event)) return;
    
    if (event.key == 'o') {
        openFile();
    }
    
    event.preventDefault();
}

function controlOrCommand(event) {
    if (window.navigator.platform.match("Mac")) {
        return event.metaKey;
    }
    return event.ctrlKey;
}