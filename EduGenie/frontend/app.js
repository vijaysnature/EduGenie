// ============================================================
// EDUGENIE FRONTEND
// ============================================================

const API_BASE_URL = "http://127.0.0.1:8000";


// ============================================================
// TASK CONFIGURATION
// ============================================================

const taskConfig = {

    qa: {
        label: "ASK A QUESTION",
        title: "What would you like to learn?",
        inputLabel: "Your question",
        placeholder: "Example: Which is the largest ocean?",
        button: "Ask EduGenie",
        endpoint: "/qa"
    },

    explain: {
        label: "EXPLAIN A TOPIC",
        title: "Make a difficult concept simple.",
        inputLabel: "Topic or concept",
        placeholder: "Example: Explain photosynthesis.",
        button: "Explain Topic",
        endpoint: "/explain"
    },

    quiz: {
        label: "GENERATE QUIZ",
        title: "Test your understanding.",
        inputLabel: "Passage or topic",
        placeholder: "Paste your educational passage here...",
        button: "Generate Quiz",
        endpoint: "/quiz"
    },

    summarize: {
        label: "SUMMARIZE",
        title: "Turn long notes into quick revision.",
        inputLabel: "Text to summarize",
        placeholder: "Paste your educational text here...",
        button: "Summarize",
        endpoint: "/summarize"
    },

    learn: {
        label: "LEARNING PATH",
        title: "Build your path from beginner to advanced.",
        inputLabel: "What do you want to learn?",
        placeholder: "Example: Python programming",
        button: "Build Learning Path",
        endpoint: "/learn/recommendations"
    }

};


// ============================================================
// DOM ELEMENTS
// ============================================================

let currentTask = "qa";

const input =
    document.getElementById("userInput");

const result =
    document.getElementById("result");

const runButton =
    document.getElementById("runBtn");

const runText =
    document.getElementById("runText");

const spinner =
    document.getElementById("spinner");

const errorBox =
    document.getElementById("errorBox");

const copyButton =
    document.getElementById("copyBtn");


// ============================================================
// TASK BUTTONS
// ============================================================

document
    .querySelectorAll(".task")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                currentTask =
                    button.dataset.task;

                document
                    .querySelectorAll(".task")
                    .forEach(item => {

                        item.classList.remove(
                            "active"
                        );

                    });

                button.classList.add(
                    "active"
                );

                updateInterface();
            }
        );

    });


// ============================================================
// UPDATE INTERFACE
// ============================================================

function updateInterface() {

    const config =
        taskConfig[currentTask];

    document.getElementById(
        "modeLabel"
    ).textContent =
        config.label;

    document.getElementById(
        "modeTitle"
    ).textContent =
        config.title;

    document.getElementById(
        "inputLabel"
    ).textContent =
        config.inputLabel;

    input.placeholder =
        config.placeholder;

    runText.textContent =
        config.button;

    clearResult();
}


// ============================================================
// CHARACTER COUNT
// ============================================================

input.addEventListener(
    "input",
    () => {

        document.getElementById(
            "charCount"
        ).textContent =
            `${input.value.length} characters`;

    }
);


// ============================================================
// CTRL + ENTER
// ============================================================

input.addEventListener(
    "keydown",
    event => {

        if (
            event.ctrlKey &&
            event.key === "Enter"
        ) {

            event.preventDefault();

            runApplication();
        }

    }
);


// ============================================================
// RUN BUTTON
// ============================================================

runButton.addEventListener(
    "click",
    runApplication
);


// ============================================================
// MAIN API FUNCTION
// ============================================================

async function runApplication() {

    const text =
        input.value.trim();

    if (!text) {

        showError(
            "Please enter some text first."
        );

        return;
    }


    setLoading(true);

    hideError();


    result.className =
        "result";

    result.innerHTML =
        "<p>EduGenie is thinking...</p>";


    try {

        const config =
            taskConfig[currentTask];


        const url =
            API_BASE_URL +
            config.endpoint;


        console.log(
            "Sending request to:",
            url
        );


        const response =
            await fetch(
                url,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        text: text
                    })
                }
            );


        // ----------------------------------------------------
        // READ RESPONSE AS TEXT FIRST
        // ----------------------------------------------------

        const responseText =
            await response.text();


        console.log(
            "Backend response:",
            responseText
        );


        // ----------------------------------------------------
        // EMPTY RESPONSE CHECK
        // ----------------------------------------------------

        if (!responseText.trim()) {

            throw new Error(
                `Backend returned an empty response. HTTP ${response.status}`
            );
        }


        // ----------------------------------------------------
        // PARSE JSON SAFELY
        // ----------------------------------------------------

        let data;

        try {

            data =
                JSON.parse(
                    responseText
                );

        } catch (jsonError) {

            console.error(
                "Invalid JSON:",
                responseText
            );

            throw new Error(
                "Backend returned invalid JSON."
            );
        }


        // ----------------------------------------------------
        // HTTP ERROR
        // ----------------------------------------------------

        if (!response.ok) {

            throw new Error(
                data.detail ||
                data.message ||
                `Server error: ${response.status}`
            );
        }


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        if (
            currentTask === "quiz"
        ) {

            if (!data.quiz) {

                throw new Error(
                    "Quiz data was not returned by the backend."
                );
            }

            renderQuiz(
                data.quiz
            );

        } else {

            if (
                typeof data.result !==
                "string"
            ) {

                throw new Error(
                    "The backend did not return a valid result."
                );
            }

            renderText(
                data.result
            );
        }


        copyButton.classList.remove(
            "hidden"
        );


    } catch (error) {

        console.error(
            "EduGenie Error:",
            error
        );


        result.className =
            "result empty";


        result.innerHTML =
            "<p>Something went wrong.</p>";


        showError(
            error.message
        );

    } finally {

        setLoading(false);
    }
}


// ============================================================
// LOADING
// ============================================================

function setLoading(loading) {

    runButton.disabled =
        loading;

    runText.classList.toggle(
        "hidden",
        loading
    );

    spinner.classList.toggle(
        "hidden",
        !loading
    );
}


// ============================================================
// TEXT RESULT
// ============================================================

function renderText(text) {

    result.className =
        "result";

    result.innerHTML =
        markdownToHTML(
            String(text)
        );
}


// ============================================================
// SIMPLE MARKDOWN
// ============================================================

function markdownToHTML(text) {

    let html =
        text
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            );


    html =
        html.replace(
            /^### (.*)$/gm,
            "<h3>$1</h3>"
        );


    html =
        html.replace(
            /^## (.*)$/gm,
            "<h3>$1</h3>"
        );


    html =
        html.replace(
            /^# (.*)$/gm,
            "<h3>$1</h3>"
        );


    html =
        html.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    html =
        html.replace(
            /^\s*[-*] (.*)$/gm,
            "<li>$1</li>"
        );


    html =
        html.replace(
            /(<li>.*<\/li>)/gs,
            "<ul>$1</ul>"
        );


    html =
        html.replace(
            /\n/g,
            "<br>"
        );


    return html;
}


// ============================================================
// QUIZ
// ============================================================

function renderQuiz(quiz) {

    result.className =
        "result";

    result.innerHTML = "";


    if (
        !quiz ||
        !Array.isArray(
            quiz.questions
        )
    ) {

        result.innerHTML =
            "<p>Invalid quiz response.</p>";

        return;
    }


    quiz.questions.forEach(
        (question, index) => {

            const block =
                document.createElement(
                    "div"
                );

            block.className =
                "quiz-question";


            const heading =
                document.createElement(
                    "h3"
                );

            heading.textContent =
                `${index + 1}. ${question.question}`;


            block.appendChild(
                heading
            );


            question.options.forEach(
                (option, optionIndex) => {

                    const button =
                        document.createElement(
                            "button"
                        );

                    button.className =
                        "option";


                    button.textContent =
                        `${String.fromCharCode(
                            65 + optionIndex
                        )}. ${option}`;


                    button.addEventListener(
                        "click",
                        () => {

                            const options =
                                block.querySelectorAll(
                                    ".option"
                                );


                            options.forEach(
                                item => {

                                    item.disabled =
                                        true;

                                }
                            );


                            if (
                                optionIndex ===
                                question.answer
                            ) {

                                button.style.borderColor =
                                    "#68e0a3";

                            } else {

                                button.style.borderColor =
                                    "#ff7777";


                                if (
                                    options[
                                        question.answer
                                    ]
                                ) {

                                    options[
                                        question.answer
                                    ].style.borderColor =
                                        "#68e0a3";
                                }

                            }


                            const explanation =
                                document.createElement(
                                    "p"
                                );


                            explanation.textContent =
                                `Explanation: ${
                                    question.explanation ||
                                    "No explanation provided."
                                }`;


                            block.appendChild(
                                explanation
                            );

                        }
                    );


                    block.appendChild(
                        button
                    );

                }
            );


            result.appendChild(
                block
            );

        }
    );
}


// ============================================================
// CLEAR
// ============================================================

function clearResult() {

    input.value = "";


    document.getElementById(
        "charCount"
    ).textContent =
        "0 characters";


    hideError();


    copyButton.classList.add(
        "hidden"
    );


    result.className =
        "result empty";


    result.innerHTML = `
        <div>✦</div>
        <p>Your result will appear here.</p>
    `;
}


document
    .getElementById("clearBtn")
    .addEventListener(
        "click",
        clearResult
    );


// ============================================================
// COPY
// ============================================================

copyButton.addEventListener(
    "click",
    async () => {

        try {

            await navigator.clipboard.writeText(
                result.innerText
            );


            copyButton.textContent =
                "Copied";


            setTimeout(
                () => {

                    copyButton.textContent =
                        "Copy";

                },
                1200
            );

        } catch (error) {

            showError(
                "Unable to copy the result."
            );
        }

    }
);


// ============================================================
// ERROR
// ============================================================

function showError(message) {

    errorBox.textContent =
        message;

    errorBox.classList.remove(
        "hidden"
    );
}


function hideError() {

    errorBox.classList.add(
        "hidden"
    );
}


// ============================================================
// INITIALIZE
// ============================================================

updateInterface();