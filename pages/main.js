const errorLog = document.querySelector('.error-log');
const messageLog = document.querySelector('.message-log');
const pathIndicator = document.getElementById('path-indicator');

const instructionsTableBody = document.getElementById('instructions-table-body');
const memoryTableBody = document.getElementById('memory-table-body');

const outputContainer = document.querySelector('.output-container');

const btnStepRun = document.getElementById('btn-step-run');
const btnRun = document.getElementById('btn-run');

const inputModal = new bootstrap.Modal('#input-modal');

let filePath;

function showPath(path) {
   document.title = path;
}

async function openFile() {
   filePath = await window.fileManager.open();
   if (!filePath) return;

   console.log(filePath);

   showPath(filePath);

   enableButtons(true);
   window.vm.load(filePath)
}

function enableButtons(enable) {
   btnRun.disabled = !enable;
   btnStepRun.disabled = !enable;
}

function run() {
   window.vm.run();
}

function stepRun() {
   window.vm.stepRun();
}

async function inputValue() {
   const input = document.getElementById('input-value');

   let value = Number(input.value);

   if (isNaN(value)) return false;

   await window.vm.input(value);
   input.value = null;
   inputModal.hide();

   return false;
}

window.vm.onData(async (event, data) => {
   console.log(data)
   try {
      data = JSON.parse(data);
      switch (data.type) {
         case 'SETUP':
            setupInstructions(data.content)
            break;
         case 'INSTRUCTION_FETCH':
            highlightInstruction(data.content);
            break;
         case 'INSTRUCTION_EXECUTE':
            updateMemory(data.content);
            break;
         case 'INPUT':
            console.log(inputModal)
            inputModal.show()
            break;
         case 'OUTPUT':
            output(data.content)
            break;
         case 'FINISH':
            enableButtons(false);
            output('execution finished', true)
            break;
      }
   } catch (e) {
      console.error(e, data);
   }
});
window.vm.onError((event, data) => {
   console.log('falha na execução:', data)
});

function setupInstructions(instructions) {
   let i = 0;

   outputContainer.innerHTML = null;
   instructionsTableBody.innerHTML = null;
   instructions.forEach(instruction => {
      createInstruction(i++, instruction);
   })
}

function highlightInstruction(pc) {
   const highlightedRow = document.querySelector('.highlighted');
   if (highlightedRow) {
      highlightedRow.className = null;
   }

   console.log(pc)
   const line = document.getElementById(pc);
   line.className = 'highlighted';
   line.scrollIntoView();
}

function createInstruction(index, instruction) {
   instructionsTableBody.innerHTML += `<tr id='${index}'>
      <td>${index}</td>
      <td>${instruction.name}</td>
      <td>${instruction.operand1}</td>
      <td>${instruction.operand2}</td>
      <td>todo</td>
   </tr>`
}

function updateMemory(memory) {
   let i = 0;
   memoryTableBody.innerHTML = null;
   memory.forEach(item => {
      memoryTableBody.innerHTML += `<tr>
         <td>${i++}</td>
         <td>${item}</td>
      </tr>`
   })
}

function output(content, end = false) {
   let className = end ? 'class="end"' : '';
   outputContainer.innerHTML +=  `<span ${className}>${content}</span><br>`;
}
