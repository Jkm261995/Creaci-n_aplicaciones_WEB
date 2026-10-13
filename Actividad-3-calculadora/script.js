// ============================================
// REFERENCIA A LA PANTALLA
// ============================================

// Guardamos el input de HTML en una variable para poder modificarlo
const pantalla = document.getElementById("display");

// Bandera (true/false): nos avisa si acabamos de mostrar un resultado,
// para saber que el próximo número debe empezar una operación nueva
let nuevaOperacion = false;

// ============================================
// FUNCIÓN: AGREGAR NÚMERO O PUNTO DECIMAL
// ============================================

/**
 * Añade un dígito o punto a la pantalla.
 * @param {string} numero - El carácter que el usuario presionó
 */
function agregarNumero(numero) {
    // Si venimos de un resultado, limpiamos para empezar de cero
    if (nuevaOperacion) {
        pantalla.value = "";
        nuevaOperacion = false;
    }

    // --- Control especial del punto decimal ---
    if (numero === ".") {
        // Separamos la expresión por operadores para ver el último número
        const partes = pantalla.value.split(/[+\-*/%]/);
        const ultimoNumero = partes[partes.length - 1];

        // Si el número actual ya tiene punto, no permitimos otro (evita 5..3)
        if (ultimoNumero.includes(".")) {
            return;
        }

        // Si no hay número antes del punto, escribimos "0." (evita 5+.)
        if (ultimoNumero === "") {
            pantalla.value = (pantalla.value === "") ? "0." : pantalla.value + "0.";
            return;
        }
    }

    // Caso normal: añadimos el número al final de la pantalla
    pantalla.value += numero;
}

// ============================================
// FUNCIÓN: AGREGAR OPERADOR (+ - * / %)
// ============================================

/**
 * Añade un operador matemático, evitando operadores duplicados.
 * @param {string} operador - El operador presionado
 */
function agregarOperador(operador) {
    const valorActual = pantalla.value;

    // Con pantalla vacía solo permitimos signo negativo (ej: -5)
    if (valorActual === "" || valorActual === "Error") {
        if (operador === "-") {
            pantalla.value = "-";
            nuevaOperacion = false;
        }
        return;
    }

    const ultimoCaracter = valorActual.slice(-1);      // Último carácter escrito
    const operadores = ["+", "-", "*", "/", "%"];      // Lista de operadores

    if (operadores.includes(ultimoCaracter)) {
        // Si ya había un operador al final, lo REEMPLAZAMOS (evita 5++3)
        pantalla.value = valorActual.slice(0, -1) + operador;
    } else {
        // Si no, simplemente lo agregamos
        pantalla.value += operador;
    }

    nuevaOperacion = false;
}

// ============================================
// FUNCIÓN: CALCULAR RESULTADO (=)
// ============================================

/**
 * Evalúa la expresión escrita y muestra el resultado en pantalla.
 */
function calcular() {
    let expresion = pantalla.value;

    // Si no hay nada que calcular, salimos de la función
    if (expresion === "" || expresion === "Error") {
        return;
    }

    try {
        // Convertimos porcentajes a división: 50% pasa a ser (50/100)
        expresion = expresion.replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");

        // SEGURIDAD: solo permitimos números y símbolos matemáticos.
        // Esto evita que se ejecute código extraño con eval()
        const expresionValida = /^[0-9+\-*/.()]+$/;
        if (!expresionValida.test(expresion)) {
            throw new Error("Expresión inválida");
        }

        // eval() resuelve la operación matemática escrita en texto.
        // (Uso educativo: en proyectos reales se usa un parser propio)
        let resultado = eval(expresion);

        // Divisiones imposibles como 5/0 generan Infinity → mostramos Error
        if (!Number.isFinite(resultado)) {
            throw new Error("Resultado inválido");
        }

        // Redondeo para evitar el clásico error 0.1 + 0.2 = 0.30000000004
        resultado = Math.round(resultado * 100000000) / 100000000;

        // Mostramos el resultado y marcamos que la próxima tecla empieza de cero
        pantalla.value = resultado.toString();
        nuevaOperacion = true;

    } catch (error) {
        // Si algo falló (ej: expresión incompleta "5+"), avisamos amablemente
        pantalla.value = "Error";
        nuevaOperacion = true;
    }
}

// ============================================
// FUNCIÓN: LIMPIAR TODO (C)
// ============================================

/**
 * Borra completamente la pantalla y reinicia el estado.
 */
function limpiar() {
    pantalla.value = "";
    nuevaOperacion = false;
}

// ============================================
// FUNCIÓN: BORRAR ÚLTIMO CARÁCTER (⌫)
// ============================================

/**
 * Elimina solo el último carácter escrito, como el backspace del teclado.
 */
function borrar() {
    // Si estamos viendo un resultado, borrar equivale a limpiar todo
    if (nuevaOperacion) {
        limpiar();
        return;
    }
    // slice(0, -1) devuelve el texto sin su último carácter
    pantalla.value = pantalla.value.slice(0, -1);
}

// ============================================
// SOPORTE DE TECLADO FÍSICO
// ============================================

/**
 * Escucha cada tecla presionada y la conecta con las funciones correctas.
 */
document.addEventListener("keydown", function (evento) {
    const tecla = evento.key;

    if (/^[0-9]$/.test(tecla)) {                 // Números 0-9
        agregarNumero(tecla);
    } else if (["+", "-", "*", "/", "%"].includes(tecla)) {  // Operadores
        agregarOperador(tecla);
    } else if (tecla === "Enter" || tecla === "=") {         // Calcular
        evento.preventDefault();
        calcular();
    } else if (tecla === "Backspace") {          // Borrar último
        borrar();
    } else if (tecla === "Escape" || tecla === "Delete") {   // Limpiar todo
        limpiar();
    } else if (tecla === ".") {                  // Punto decimal
        agregarNumero(".");
    }
});

// Mensaje de confirmación en la consola del navegador (F12)
console.log("🧮 Calculadora cargada correctamente.");
console.log("💡 Recuerda: puedes usar el teclado físico también.");