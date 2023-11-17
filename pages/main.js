const errorLog = document.querySelector('.error-log');
const messageLog = document.querySelector('.message-log');
const pathIndicator = document.getElementById('path-indicator');

let filePath;
let editor;

function showPath(path) {
   pathIndicator.innerText = path;
   document.title = path;
}

async function openFile() {
   filePath = await window.fileManager.open();
   if (!filePath) return;

   console.log(filePath);

   showPath(filePath);

   const content = await window.fileManager.read(filePath);

   editor.getModel().setValue(content);
   showErrors()
}

async function writeFile() {
   if (!editor) return;

   const content = editor.getModel().getValue();

   filePath = await window.fileManager.write(filePath, content);
   if (!filePath) return;

   showPath(filePath);
}

async function compile() {
   if (!editor) return;
   await writeFile();
   if (!filePath) return;

   const result = await window.compiler.compile(filePath);
   messageLog.innerText = result.message;

   showErrors(result.error);

   editor.onDidChangeModelContent(() => {
      editor.createDecorationsCollection([
         {
            range: new monaco.Range(3, 1, 3, 1),
            options: {
               isWholeLine: true,
               glyphMarginClassName: "myClassName",
            },
         },
         ]);
   });
}

function showErrors(errorMessage = null) {
   let markers = [];

   if (errorMessage) {
      const error = parseError(errorMessage);

      markers.push({
         message: error.message,
         severity: monaco.MarkerSeverity.Error,
         startLineNumber: error.line || 0,
         startColumn: error.column || 0,
         endLineNumber: error.line || 0,
         endColumn: error.column || 0,
      });

      editor.revealPositionInCenter({ lineNumber: error.line || 0, column: error.column || 0 });
   }
   monaco.editor.setModelMarkers(editor.getModel(), 'owner', markers);
   errorLog.innerText = errorMessage;
}

function parseError(error) {
   let startIndex = error.indexOf(":");
   if (startIndex == -1) {
      return { message: error };
   }
   startIndex += 1;
   const endIndex = error.indexOf("\n");
   const position = error.substring(startIndex, endIndex).split(":");

   if (position.length == 1) {
      return { message: error };
   }
   const message = error.substr(endIndex + 1);

   return {
      line: Number(position[0]),
      column: Number(position[1]),
      message: message
   }
}

function onEditorReady() {
   const options = {
      //autoIndent: 'full',
      //contextmenu: true,
      //fontFamily: 'monospace',
      fontSize: 13,
      //lineHeight: 24,
      hideCursorInOverviewRuler: true,
      matchBrackets: 'always',
      minimap: {
         enabled: true,
      },
      scrollbar: {
         horizontalSliderSize: 4,
         verticalSliderSize: 18,
      },
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly: false,
      cursorStyle: 'line',
      automaticLayout: true,
      language: 'lulang',
      theme: 'lulang-ptheme'
   };

   editor = monaco.editor.create(document.getElementById('editor'), options);
}
