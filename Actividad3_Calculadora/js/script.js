
/* =====================================================
   ACTIVIDAD 3 - CALCULADORA WEB
   Lógica desarrollada con JavaScript
===================================================== */

// 1. REFERENCIAS A LOS ELEMENTOS HTML

const currentOperation = document.getElementById("currentOperation");
const previousOperation = document.getElementById("previousOperation");
const displayStatus = document.getElementById("displayStatus");

const keypad = document.querySelector(".keypad");
const historyList = document.getElementById("historyList");
const clearHistoryButton = document.getElementById("clearHistory");
const themeButton = document.getElementById("themeButton");

// 2. VARIABLES PRINCIPALES

let expression = "";
let justCalculated = false;
let hasError = false;

// 3. MOSTRAR LA OPERACIÓN EN PANTALLA

function updateDisplay() {
    currentOperation.textContent = expression || "0";

    // Mostrar los operadores matemáticos
    previousOperation.textContent = "";

    displayStatus.textContent = hasError
        ? "ERROR EN LA OPERACIÓN"
        : justCalculated
            ? "RESULTADO CALCULADO"
            : "LISTO PARA CALCULAR";
}

// 4. FORMATEAR LOS RESULTADOS

function formatResult(number) {
    if (!Number.isFinite(number)) {
        throw new Error("Resultado no válido");
    }

    const rounded = Number(number.toPrecision(12));

    return String(Object.is(rounded, -0) ? 0 : rounded);
}

// 5. ANALIZADOR MATEMÁTICO
// Permite resolver expresiones sin utilizar eval().

function evaluateExpression(input) {

    const tokens = input.match(
        /(?:\d+(?:\.\d*)?|\.\d+)|[+\-*/()%]/g
    );

    if (!tokens || tokens.join("") !== input) {
        throw new Error("Expresión inválida");
    }

    let position = 0;

    // Leer números y porcentajes
    function parseFactor() {

        let sign = 1;

        // Permitir números positivos y negativos
        while (tokens[position] === "+" ||
               tokens[position] === "-") {

            if (tokens[position] === "-") {
                sign *= -1;
            }

            position++;
        }

        let value;

        if (tokens[position] === "(") {

            position++;

            value = parseExpression();

            if (tokens[position] !== ")") {
                throw new Error("Paréntesis incorrectos");
            }

            position++;

        } else {

            const token = tokens[position];

            if (!token || !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(token)) {
                throw new Error("Número inválido");
            }

            value = Number(token);
            position++;
        }

        value *= sign;

        // Convertir el valor en porcentaje
        if (tokens[position] === "%") {
            value = value / 100;
            position++;
        }

        return value;
    }

    // Resolver multiplicaciones y divisiones
    function parseTerm() {

        let value = parseFactor();

        while (
            tokens[position] === "*" ||
            tokens[position] === "/"
        ) {

            const operator = tokens[position];
            position++;

            const nextValue = parseFactor();

            if (operator === "*") {
                value *= nextValue;
            } else {

                if (nextValue === 0) {
                    throw new Error("No se puede dividir para cero");
                }

                value /= nextValue;
            }
        }

        return value;
    }

    // Resolver sumas y restas
    function parseExpression() {

        let value = parseTerm();

        while (
            tokens[position] === "+" ||
            tokens[position] === "-"
        ) {

            const operator = tokens[position];
            position++;

            const nextValue = parseTerm();

            if (operator === "+") {
                value += nextValue;
            } else {
                value -= nextValue;
            }
        }

        return value;
    }

    const result = parseExpression();

    if (position !== tokens.length || !Number.isFinite(result)) {
        throw new Error("Operación matemática inválida");
    }

    return result;
}

// 6. AGREGAR NÚMEROS

function appendNumber(number) {

    if (hasError) {
        clearCalculator();
    }

    if (justCalculated) {
        expression = "";
        previousOperation.textContent = "";
        justCalculated = false;
    }

    const lastNumber = expression.split(/[+\-*/()%]/).pop();

    // Evitar más de un punto decimal
    if (number === "." && lastNumber.includes(".")) {
        return;
    }

    if (number === ".") {

        if (lastNumber === "") {
            expression += "0.";
        } else {
            expression += ".";
        }

    } else {
        expression += number;
    }

    updateDisplay();
}

// 7. AGREGAR OPERADORES

function appendOperator(operator) {

    if (hasError) return;

    if (expression === "") {

        if (operator === "-") {
            expression = "-";
            updateDisplay();
        }

        return;
    }

    if (justCalculated) {
        justCalculated = false;
    }

    const lastCharacter = expression.slice(-1);

    if ("+-*/".includes(lastCharacter)) {

        // Permitir un signo negativo después de otro operador
        if (operator === "-" && lastCharacter !== "-") {
            expression += operator;
        } else {
            expression = expression.slice(0, -1) + operator;
        }

    } else if (lastCharacter === "(") {

        if (operator === "-") {
            expression += operator;
        } else {
            return;
        }

    } else if (lastCharacter === ".") {

        return;

    } else {

        expression += operator;
    }

    updateDisplay();
}

// 8. CAMBIAR SIGNO POSITIVO / NEGATIVO

function changeSign() {

    if (hasError || expression === "") return;

    const match = expression.match(/(\d*\.?\d+)$/);

    if (!match) return;

    const number = match[0];
    const start = match.index;

    const before = expression.slice(0, start);

    if (before.endsWith("-") &&
        (before.length === 1 || "+-*/(".includes(before.slice(-2, -1)))) {

        expression = before.slice(0, -1) + number;

    } else {

        expression = before + "-" + number;
    }

    justCalculated = false;
    updateDisplay();
}

// 9. CALCULAR PORCENTAJE

function appendPercent() {

    if (hasError || !expression) return;

    if (/\d$/.test(expression) || expression.endsWith(")")) {

        expression += "%";
        justCalculated = false;
        updateDisplay();
    }
}

// 10. ELIMINAR EL ÚLTIMO CARÁCTER

function deleteLast() {

    if (hasError || justCalculated) {
        clearCalculator();
        return;
    }

    expression = expression.slice(0, -1);

    updateDisplay();
}

// 11. LIMPIAR CALCULADORA

function clearCalculator() {

    expression = "";
    justCalculated = false;
    hasError = false;

    previousOperation.textContent = "";

    updateDisplay();
}

// 12. REALIZAR EL CÁLCULO

function calculate() {

    if (!expression || hasError) return;

    const originalExpression = expression;

    try {

        const result = evaluateExpression(expression);
        const formattedResult = formatResult(result);

        previousOperation.textContent =
            originalExpression.replace(/\*/g, "×")
                              .replace(/\//g, "÷") + " =";

        expression = formattedResult;

        justCalculated = true;
        hasError = false;

        displayStatus.textContent = "RESULTADO CALCULADO";

        addToHistory(originalExpression, formattedResult);

        currentOperation.textContent = formattedResult;

    } catch (error) {

        currentOperation.textContent = "Error";

        displayStatus.textContent = error.message;

        expression = "";
        hasError = true;
        justCalculated = false;
    }
}

// 13. AGREGAR OPERACIONES AL HISTORIAL

function addToHistory(operation, result) {

    const emptyMessage = historyList.querySelector(".empty-history");

    if (emptyMessage) {
        emptyMessage.remove();
    }

    const item = document.createElement("li");

    item.textContent =
        operation.replace(/\*/g, "×")
                 .replace(/\//g, "÷") +
        " = " + result;

    historyList.prepend(item);
}

// 14. LIMPIAR HISTORIAL

clearHistoryButton.addEventListener("click", function () {

    historyList.innerHTML = `
        <li class="empty-history">
            No hay operaciones todavía.
        </li>
    `;

});

// 15. CAMBIAR ENTRE MODO OSCURO Y CLARO

themeButton.addEventListener("click", function () {

    document.body.classList.toggle("light-mode");

    const icon = themeButton.querySelector("i");

    if (document.body.classList.contains("light-mode")) {

        icon.classList.replace("fa-moon", "fa-sun");

    } else {

        icon.classList.replace("fa-sun", "fa-moon");
    }

});

// 16. IDENTIFICAR LOS BOTONES DE LA CALCULADORA

keypad.addEventListener("click", function (event) {

    const button = event.target.closest("button");

    if (!button) return;

    const value = button.dataset.value;
    const action = button.dataset.action;

    if (value !== undefined) {

        if ("0123456789.".includes(value)) {
            appendNumber(value);
        } else {
            appendOperator(value);
        }

    }

    if (action === "clear") {
        clearCalculator();
    }

    if (action === "delete") {
        deleteLast();
    }

    if (action === "percent") {
        appendPercent();
    }

    if (action === "sign") {
        changeSign();
    }

    if (action === "calculate") {
        calculate();
    }

});

// 17. SOPORTE PARA TECLADO FÍSICO

document.addEventListener("keydown", function (event) {

    const key = event.key;

    if (/^[0-9.]$/.test(key)) {
        appendNumber(key);
    }

    if (["+", "-", "*", "/"].includes(key)) {
        appendOperator(key);
    }

    if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
    }

    if (key === "Backspace") {
        deleteLast();
    }

    if (key === "Escape") {
        clearCalculator();
    }

    if (key === "%") {
        appendPercent();
    }

});

// 18. INICIALIZAR CALCULADORA

updateDisplay();

console.log("Calculadora web inicializada correctamente.");
