document.onkeydown = (event) => {
    if (!controlOrCommand(event)) return;
    
    if (event.key == 'o') {
        openFile();
    }
    
    if (event.key == 'l') {
        run();
    }

    if (event.key == 'p') {
        stepRun();
    }

    event.preventDefault();
}

function controlOrCommand(event) {
    if (window.navigator.platform.match("Mac")) {
        return event.metaKey;
    }
    return event.ctrlKey;
}