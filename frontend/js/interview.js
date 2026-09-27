const API = "http://127.0.0.1:8000";


// =========================================
// LOCAL STORAGE
// =========================================
console.log("INTERVIEW JS LOADED");
const userId =
    localStorage.getItem("user_id");

const topic =
    localStorage.getItem("topic");

let currentDifficulty =
    localStorage.getItem("current_difficulty") ||
    localStorage.getItem("difficulty");

let questionId =
    localStorage.getItem("current_question_id");

let currentQuestion =
    localStorage.getItem("current_question");


// =========================================
// SESSION VARIABLES
// =========================================

let questionNumber = 1;

let lastScore = 0;

let timerInterval = null;

let timeLeft = 120;

let recognition = null;

let isListening = false;

let submitted = false;


// =========================================
// ELEMENTS
// =========================================

const questionElement =
    document.getElementById("question");

const questionNumberElement =
    document.getElementById("questionNumber");

const topicElement =
    document.getElementById("topic");

const difficultyElement =
    document.getElementById("difficulty");

const timerElement =
    document.getElementById("timer");

const answerElement =
    document.getElementById("answer");

const wordCountElement =
    document.getElementById("wordCount");

const micButton =
    document.getElementById("micBtn");

const resetSpeechButton =
    document.getElementById("resetSpeechBtn");

const listeningStatus =
    document.getElementById("listeningStatus");

const submitButton =
    document.getElementById("submitBtn");

const resultElement =
    document.getElementById("result");

const nextQuestionButton =
    document.getElementById("nextQuestionBtn");

const dashboardButton =
    document.getElementById("dashboardBtn");


// =========================================
// INITIAL LOAD
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (!userId) {

            alert("Please login first.");

            window.location.href =
                "login.html";

            return;
        }


        if (!topic || !currentDifficulty) {

            alert(
                "Please select a topic and difficulty."
            );

            window.location.href =
                "index.html";

            return;
        }


        if (topicElement) {
            topicElement.textContent =
                topic;
        }


        if (difficultyElement) {
            difficultyElement.textContent =
                currentDifficulty;
        }


        if (questionNumberElement) {
            questionNumberElement.textContent =
                questionNumber;
        }


        initializeSpeechRecognition();

        updateWordCount();

        startTimer();


        if (
            questionId &&
            currentQuestion
        ) {

            showQuestion();

        } else {

            loadFirstQuestion();

        }


        if (answerElement) {

            answerElement.addEventListener(
                "input",
                updateWordCount
            );

        }


        if (micButton) {

            micButton.addEventListener(
                "click",
                toggleSpeech
            );

        }


        if (resetSpeechButton) {

            resetSpeechButton.addEventListener(
                "click",
                resetSpeech
            );

        }


        if (submitButton) {

            submitButton.addEventListener(
                "click",
                submitAnswer
            );

        }


        if (nextQuestionButton) {

            nextQuestionButton.addEventListener(
                "click",
                nextQuestion
            );

        }


        if (dashboardButton) {

            dashboardButton.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "dashboard.html";

                }
            );

        }

    }
);


// =========================================
// SHOW CURRENT QUESTION
// =========================================

function showQuestion() {

    if (questionElement) {

        questionElement.textContent =
            currentQuestion ||
            "Unable to load question.";

    }


    if (topicElement) {

        topicElement.textContent =
            topic;

    }


    if (difficultyElement) {

        difficultyElement.textContent =
            currentDifficulty;

    }


    if (questionNumberElement) {

        questionNumberElement.textContent =
            questionNumber;

    }


    resetAnswerState();

}


// =========================================
// LOAD FIRST QUESTION
// =========================================

async function loadFirstQuestion() {

    try {

        questionElement.textContent =
            "Generating your question...";


        const response = await fetch(
            `${API}/rag/question?` +
            `topic=${encodeURIComponent(topic)}` +
            `&difficulty=${encodeURIComponent(currentDifficulty)}`
        );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.question
        ) {

            throw new Error(
                "Question generation failed."
            );

        }


        questionId =
            data.question_id;

        currentQuestion =
            data.question;


        localStorage.setItem(
            "current_question_id",
            questionId
        );


        localStorage.setItem(
            "current_question",
            currentQuestion
        );


        showQuestion();

    } catch (error) {

        console.error(
            "Question loading error:",
            error
        );


        questionElement.textContent =
            "Unable to generate the question.";


        alert(
            "Unable to generate interview question."
        );

    }

}


// =========================================
// TIMER
// =========================================

function startTimer() {

    clearInterval(timerInterval);


    timeLeft = 120;

    updateTimer();


    timerInterval = setInterval(
        () => {

            timeLeft--;

            updateTimer();


            if (timeLeft <= 0) {

                clearInterval(
                    timerInterval
                );


                if (!submitted) {

                    submitAnswer();

                }

            }

        },
        1000
    );

}


// =========================================
// UPDATE TIMER
// =========================================

function updateTimer() {

    if (!timerElement) {
        return;
    }


    const minutes =
        Math.floor(timeLeft / 60);

    const seconds =
        timeLeft % 60;


    timerElement.textContent =
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}`;

}


// =========================================
// WORD COUNT
// =========================================

function updateWordCount() {

    if (!answerElement ||
        !wordCountElement) {

        return;
    }


    const text =
        answerElement.value.trim();


    if (!text) {

        wordCountElement.textContent =
            "0";

        return;

    }


    const words =
        text.split(/\s+/).length;


    wordCountElement.textContent =
        words;

}


// =========================================
// SPEECH RECOGNITION
// =========================================

function initializeSpeechRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        if (micButton) {

            micButton.disabled = true;

            micButton.innerHTML =
                "🎙 Speech not supported";

        }


        if (listeningStatus) {

            listeningStatus.textContent =
                "Speech recognition is not supported in this browser.";

        }


        return;

    }


    recognition =
        new SpeechRecognition();


    recognition.continuous = true;

    recognition.interimResults = true;

    recognition.lang = "en-US";


    recognition.onstart = () => {

        isListening = true;

        updateMicrophoneUI();

    };


    recognition.onresult = (event) => {

        let finalText = "";

        let interimText = "";


        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {

            const transcript =
                event.results[i][0].transcript;


            if (
                event.results[i].isFinal
            ) {

                finalText +=
                    transcript + " ";

            } else {

                interimText +=
                    transcript;

            }

        }


        if (finalText) {

            answerElement.value +=
                finalText;

        }


        updateWordCount();

    };


    recognition.onerror = (event) => {

        console.error(
            "Speech recognition error:",
            event.error
        );


        if (event.error === "not-allowed") {

            listeningStatus.textContent =
                "Microphone permission was denied.";

        } else {

            listeningStatus.textContent =
                "Speech recognition error.";

        }


        isListening = false;

        updateMicrophoneUI();

    };


    recognition.onend = () => {

        isListening = false;

        updateMicrophoneUI();

    };

}


// =========================================
// TOGGLE SPEECH
// =========================================

function toggleSpeech() {

    if (!recognition) {

        alert(
            "Speech recognition is not supported."
        );

        return;

    }


    if (isListening) {

        stopSpeech();

    } else {

        try {

            recognition.start();

        } catch (error) {

            console.error(error);

        }

    }

}


// =========================================
// STOP SPEECH
// =========================================

function stopSpeech() {

    if (
        recognition &&
        isListening
    ) {

        recognition.stop();

    }


    isListening = false;

    updateMicrophoneUI();

}


// =========================================
// RESET SPEECH
// =========================================

function resetSpeech() {

    stopSpeech();


    if (answerElement) {

        answerElement.value = "";

    }


    updateWordCount();


    if (listeningStatus) {

        listeningStatus.textContent =
            "Microphone is ready";

    }

}


// =========================================
// MICROPHONE UI
// =========================================

function updateMicrophoneUI() {

    if (!micButton) {
        return;
    }


    if (isListening) {

        micButton.innerHTML =
            "⏹ Stop Speaking";


        micButton.classList.add(
            "listening"
        );


        if (listeningStatus) {

            listeningStatus.textContent =
                "Listening... speak your answer.";

        }

    } else {

        micButton.innerHTML =
            "🎙 Start Speaking";


        micButton.classList.remove(
            "listening"
        );


        if (listeningStatus) {

            listeningStatus.textContent =
                "Microphone is ready";

        }

    }

}


// =========================================
// SUBMIT ANSWER
// =========================================

async function submitAnswer() {

    if (submitted) {
        return;
    }


    const answer =
        answerElement.value.trim();


    if (!answer) {

        alert(
            "Please provide an answer before submitting."
        );

        return;

    }


    stopSpeech();


    submitted = true;


    if (submitButton) {

        submitButton.disabled = true;

        submitButton.textContent =
            "Analyzing...";

    }


    try {

        const url =
            `${API}/interview/submit?` +
            `user_id=${encodeURIComponent(userId)}` +
            `&question_id=${encodeURIComponent(questionId)}` +
            `&answer=${encodeURIComponent(answer)}`;


        const response =
            await fetch(
                url,
                {
                    method: "POST"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                data.message ||
                "Unable to submit answer."
            );

        }


        if (data.message) {

            alert(data.message);

            submitted = false;

            if (submitButton) {

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Submit Answer";

            }

            return;

        }


        lastScore =
            Number(data.score) || 0;


        showAnalysis(data);


        clearInterval(
            timerInterval
        );


    } catch (error) {

        console.error(
            "Submit error:",
            error
        );


        alert(
            error.message ||
            "Unable to submit answer."
        );


        submitted = false;


        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "Submit Answer";

        }

    }

}


// =========================================
// SHOW AI ANALYSIS
// =========================================

function showAnalysis(data) {

    if (!resultElement) {
        return;
    }


    resultElement.classList.remove(
        "hidden"
    );


    const score =
        Number(data.score) || 0;


    const correctness =
        Number(data.correctness) || 0;


    const relevance =
        Number(data.relevance) || 0;


    const completeness =
        Number(data.completeness) || 0;


    const clarity =
        Number(data.clarity) || 0;


    setText(
        "score",
        score
    );


    setText(
        "correctness",
        correctness
    );


    setText(
        "relevance",
        relevance
    );


    setText(
        "completeness",
        completeness
    );


    setText(
        "clarity",
        clarity
    );


    setText(
        "encouragement",
        data.encouragement ||
        "Keep practicing and improving!"
    );


    updateProgressBar(
        "correctnessBar",
        correctness
    );


    updateProgressBar(
        "relevanceBar",
        relevance
    );


    updateProgressBar(
        "completenessBar",
        completeness
    );


    updateProgressBar(
        "clarityBar",
        clarity
    );


    displayList(
        "strengths",
        data.strengths
    );


    displayList(
        "improvements",
        data.improvements
    );


    setText(
        "xpEarned",
        `+${data.xp_earned || 0} XP`
    );


    setText(
        "coinsEarned",
        `+${data.coins_earned || 0}`
    );


    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.textContent =
            "Answer Submitted";

    }


    if (nextQuestionButton) {

        nextQuestionButton.disabled =
            false;

    }


    resultElement.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// =========================================
// SET TEXT
// =========================================

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


// =========================================
// PROGRESS BAR
// =========================================

function updateProgressBar(
    id,
    value
) {

    const bar =
        document.getElementById(id);


    if (!bar) {
        return;
    }


    const safeValue =
        Math.max(
            0,
            Math.min(
                10,
                Number(value) || 0
            )
        );


    bar.style.width =
        `${safeValue * 10}%`;

}


// =========================================
// DISPLAY LIST
// =========================================

function displayList(
    id,
    items
) {

    const list =
        document.getElementById(id);


    if (!list) {
        return;
    }


    list.innerHTML = "";


    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        const li =
            document.createElement("li");

        li.textContent =
            "No feedback available.";

        list.appendChild(li);

        return;

    }


    items.forEach(item => {

        const li =
            document.createElement("li");


        li.textContent =
            item;


        list.appendChild(li);

    });

}


// =========================================
// NEXT ADAPTIVE QUESTION
// =========================================

async function nextQuestion() {

    if (questionNumber >= 10) {

        showInterviewComplete();

        return;

    }


    if (nextQuestionButton) {

        nextQuestionButton.disabled =
            true;

        nextQuestionButton.textContent =
            "Generating...";

    }


    try {

        const response =
            await fetch(
                `${API}/interview/next-question?` +
                `topic=${encodeURIComponent(topic)}` +
                `&difficulty=${encodeURIComponent(currentDifficulty)}` +
                `&previous_score=${encodeURIComponent(lastScore)}`
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.question
        ) {

            throw new Error(
                data.message ||
                "Unable to generate next question."
            );

        }


        questionNumber++;


        questionId =
            data.question_id;


        currentQuestion =
            data.question;


        currentDifficulty =
            data.difficulty;


        localStorage.setItem(
            "current_question_id",
            questionId
        );


        localStorage.setItem(
            "current_question",
            currentQuestion
        );


        localStorage.setItem(
            "current_difficulty",
            currentDifficulty
        );


        if (questionNumberElement) {

            questionNumberElement.textContent =
                questionNumber;

        }


        if (questionElement) {

            questionElement.textContent =
                currentQuestion;

        }


        if (difficultyElement) {

            difficultyElement.textContent =
                currentDifficulty;

        }


        resetAnswerState();


        lastScore = 0;


        startTimer();


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


    } catch (error) {

        console.error(
            "Next question error:",
            error
        );


        alert(
            error.message ||
            "Unable to load next question."
        );

    } finally {

        if (nextQuestionButton) {

            nextQuestionButton.disabled =
                false;

            nextQuestionButton.textContent =
                "Next Question →";

        }

    }

}


// =========================================
// RESET ANSWER STATE
// =========================================

function resetAnswerState() {

    submitted = false;


    if (answerElement) {

        answerElement.value = "";

    }


    updateWordCount();


    if (submitButton) {

        submitButton.disabled =
            false;

        submitButton.textContent =
            "Submit Answer";

    }


    if (resultElement) {

        resultElement.classList.add(
            "hidden"
        );

    }


    resetAnalysis();


    stopSpeech();


    if (listeningStatus) {

        listeningStatus.textContent =
            "Microphone is ready";

    }


    if (nextQuestionButton) {

        nextQuestionButton.disabled =
            false;

    }

}


// =========================================
// RESET ANALYSIS
// =========================================

function resetAnalysis() {

    setText(
        "score",
        "0"
    );


    setText(
        "correctness",
        "0"
    );


    setText(
        "relevance",
        "0"
    );


    setText(
        "completeness",
        "0"
    );


    setText(
        "clarity",
        "0"
    );


    setText(
        "encouragement",
        "Keep practicing!"
    );


    updateProgressBar(
        "correctnessBar",
        0
    );


    updateProgressBar(
        "relevanceBar",
        0
    );


    updateProgressBar(
        "completenessBar",
        0
    );


    updateProgressBar(
        "clarityBar",
        0
    );


    displayList(
        "strengths",
        []
    );


    displayList(
        "improvements",
        []
    );


    setText(
        "xpEarned",
        "+0 XP"
    );


    setText(
        "coinsEarned",
        "+0"
    );

}


// =========================================
// INTERVIEW COMPLETE
// =========================================

function showInterviewComplete() {

    clearInterval(
        timerInterval
    );


    stopSpeech();


    if (resultElement) {

        resultElement.classList.add(
            "hidden"
        );

    }


    const completion =
        document.getElementById(
            "completionScreen"
        );


    if (completion) {

        completion.classList.remove(
            "hidden"
        );


        completion.scrollIntoView({
            behavior: "smooth"
        });

    }

}