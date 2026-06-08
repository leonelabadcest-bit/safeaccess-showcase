/* ESP32 Simulator Logic - Serial Console Version */

// State variables (Mirroring the provided Arduino code)
const clave = [1, 2, 3, 4];
let dato = [0, 0, 0, 0];
let posicion = 0;
let sistemaAbierto = false;

// UI Elements
const consoleOutput = document.getElementById('console-output');
const consoleInput = document.getElementById('console-input');
const ledGreen = document.getElementById('led-green');
const ledRed = document.getElementById('led-red');
const servoArm = document.getElementById('servo-arm');
const servoAngle = document.getElementById('servo-angle');
const doorStatus = document.getElementById('door-status');

// 7-Segment segments mapping (a, b, c, d, e, f, g)
const numeros = [
    [1, 1, 1, 1, 1, 1, 0], // 0
    [0, 1, 1, 0, 0, 0, 0], // 1
    [1, 1, 0, 1, 1, 0, 1], // 2
    [1, 1, 1, 1, 0, 0, 1], // 3
    [0, 1, 1, 0, 0, 1, 1], // 4
    [1, 0, 1, 1, 0, 1, 1], // 5
    [0, 0, 1, 1, 1, 1, 1], // 6
    [1, 1, 1, 0, 0, 0, 0], // 7
    [1, 1, 1, 1, 1, 1, 1], // 8
    [1, 1, 1, 0, 0, 1, 1]  // 9
];

const segmentIds = ['seg-a', 'seg-b', 'seg-c', 'seg-d', 'seg-e', 'seg-f', 'seg-g'];

// Initialization
function setup() {
    printToConsole("Sistema Iniciado. Ingrese clave:", "text-blue-400");
    updateHardwareUI();
}

// Logic Functions
function printToConsole(text, colorClass = "text-slate-400") {
    const p = document.createElement('p');
    p.className = colorClass;
    p.innerText = text;
    consoleOutput.appendChild(p);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function mostrarUnDigito(numero) {
    if (numero < 0 || numero > 9) return;
    const bits = numeros[numero];
    segmentIds.forEach((id, index) => {
        const seg = document.getElementById(id);
        if (bits[index] === 1) {
            seg.classList.add('on');
            seg.classList.remove('off');
        } else {
            seg.classList.add('off');
            seg.classList.remove('on');
        }
    });
}

function verificarClave() {
    let claveCorrecta = true;
    for (let i = 0; i < 4; i++) {
        if (dato[i] !== clave[i]) {
            claveCorrecta = false;
            break;
        }
    }

    if (claveCorrecta) {
        sistemaAbierto = !sistemaAbierto;
        if (sistemaAbierto) {
            printToConsole("PUERTA ABIERTA", "text-green-400 font-bold uppercase");
            updateHardwareState(true);
        } else {
            printToConsole("PUERTA CERRADA", "text-red-400 font-bold uppercase");
            updateHardwareState(false);
        }
    } else {
        printToConsole("CLAVE INCORRECTA", "text-red-500 font-bold uppercase");
        blinkRedLed();
    }

    // Reset for next entry
    posicion = 0;
    setTimeout(() => {
        mostrarUnDigito(0);
    }, 500);
}

function updateHardwareState(open) {
    if (open) {
        servoArm.classList.remove('locked');
        servoArm.classList.add('unlocked');
        servoAngle.innerText = "100°";
        doorStatus.innerText = "Abierta";
        doorStatus.className = "text-xl font-bold font-display text-green-500 uppercase";
        ledGreen.classList.add('on');
        ledGreen.classList.remove('off');
        ledRed.classList.add('off');
        ledRed.classList.remove('on');
    } else {
        servoArm.classList.remove('unlocked');
        servoArm.classList.add('locked');
        servoAngle.innerText = "0°";
        doorStatus.innerText = "Cerrada";
        doorStatus.className = "text-xl font-bold font-display text-red-500 uppercase";
        ledGreen.classList.add('off');
        ledGreen.classList.remove('on');
        ledRed.classList.add('on');
        ledRed.classList.remove('off');
    }
}

function updateHardwareUI() {
    mostrarUnDigito(0);
    updateHardwareState(sistemaAbierto);
}

function blinkRedLed() {
    ledRed.classList.add('blink-error');
    setTimeout(() => {
        ledRed.classList.remove('blink-error');
    }, 600);
}

// Event Listeners
consoleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const valor = consoleInput.value.trim();
        consoleInput.value = '';

        if (valor === '*' || valor === '#') {
            posicion = 0;
            mostrarUnDigito(0);
            printToConsole("Entrada reseteada", "text-yellow-500");
            return;
        }

        const num = parseInt(valor);
        if (!isNaN(num) && num >= 0 && num <= 9) {
            dato[posicion] = num;
            printToConsole(`Digito ${posicion + 1}: ${num}`, "text-slate-300");
            mostrarUnDigito(num);
            posicion++;

            if (posicion >= 4) {
                setTimeout(verificarClave, 500);
            }
        } else {
            // No action for non-digit input, mirroring 'if (valor >= '0' && valor <= '9')'
        }
    }
});

// Auto-focus input when clicking console
document.getElementById('console-output').parentNode.addEventListener('click', () => {
    consoleInput.focus();
});

// Start simulation
setup();
