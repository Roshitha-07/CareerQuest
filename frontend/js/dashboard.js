const API = "http://127.0.0.1:8000";

const userId = localStorage.getItem("user_id");
const userName = localStorage.getItem("user_name");


/* =========================================
   LOGIN CHECK
========================================= */

if (!userId) {
    alert("Please login first.");
    window.location.href = "login.html";
}


/* =========================================
   USER NAME
========================================= */

if (userName) {

    const userNameElement =
        document.getElementById("userName");

    const navUserNameElement =
        document.getElementById("navUserName");

    if (userNameElement) {
        userNameElement.innerText = userName;
    }

    if (navUserNameElement) {
        navUserNameElement.innerText = userName;
    }
}


/* =========================================
   LOAD DASHBOARD
========================================= */

async function loadDashboard() {

    try {

        const response = await fetch(
            `${API}/performance/${userId}`
        );

        if (!response.ok) {
            throw new Error("Unable to load dashboard data");
        }

        const data = await response.json();


        /* ---------------------------------
           BASIC STATS
        --------------------------------- */

        setText(
            "questions",
            data.questions_answered || 0
        );

        setText(
            "average",
            data.average_score || 0
        );

        setText(
            "streak",
            data.current_streak || 0
        );

        setText(
            "best",
            data.best_streak || 0
        );

        setText(
            "xp",
            data.xp || 0
        );

        setText(
            "coins",
            data.coins || 0
        );


        /* ---------------------------------
           ACTIVITY
        --------------------------------- */

        createHeatmap(
            data.activity || []
        );


        /* ---------------------------------
           TOPIC PERFORMANCE
        --------------------------------- */

        createTopicChart(
            data.topic_performance || {}
        );

        createTopicScores(
            data.topic_performance || {}
        );


        /* ---------------------------------
           INSIGHTS
        --------------------------------- */

        createInsights(data);

    }

    catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

        const topicContainer =
            document.getElementById(
                "topicPerformance"
            );

        if (topicContainer) {

            topicContainer.innerHTML = `
                <div class="empty-state">
                    Unable to load performance data.
                </div>
            `;
        }
    }
}


/* =========================================
   HELPER
========================================= */

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.innerText = value;
    }
}


/* =========================================
   PRACTICE ACTIVITY HEATMAP
========================================= */

function createHeatmap(activity) {

    const container =
        document.getElementById(
            "activityHeatmap"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";


    /* ---------------------------------
       CREATE DATE → COUNT MAP
    --------------------------------- */

    const activityMap = {};

    activity.forEach(item => {

        activityMap[item.date] =
            Number(item.count) || 0;

    });


    /* ---------------------------------
       LAST 365 DAYS
    --------------------------------- */

    const today = new Date();

    const days = 365;


    for (
        let i = days - 1;
        i >= 0;
        i--
    ) {

        const date =
            new Date(today);

        date.setDate(
            today.getDate() - i
        );


        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");


        const dateString =
            `${year}-${month}-${day}`;


        const count =
            activityMap[dateString] || 0;


        /* ---------------------------------
           CREATE CELL
        --------------------------------- */

        const cell =
            document.createElement("div");


        /*
           IMPORTANT:
           CSS uses activity-cell
        */

        cell.className =
            "activity-cell";


        /* ---------------------------------
           ACTIVITY LEVEL
        --------------------------------- */

        let level = 0;

        if (count === 0) {

            level = 0;

        }
        else if (count === 1) {

            level = 1;

        }
        else if (count <= 3) {

            level = 2;

        }
        else if (count <= 5) {

            level = 3;

        }
        else {

            level = 4;

        }


        cell.classList.add(
            `level-${level}`
        );


        /* ---------------------------------
           TOOLTIP
        --------------------------------- */

        cell.title =
            `${dateString}: ${count} question${count === 1 ? "" : "s"}`;


        container.appendChild(cell);
    }


    /* ---------------------------------
       TOTAL QUESTIONS
    --------------------------------- */

    const total =
        activity.reduce(
            (sum, item) =>
                sum + (Number(item.count) || 0),
            0
        );


    const message =
        document.getElementById(
            "activityMessage"
        );

    if (message) {

        message.innerText =
            `${total} question${total === 1 ? "" : "s"} practiced`;
    }
}


/* =========================================
   TOPIC CHART
========================================= */

let topicChart = null;


function createTopicChart(topics) {

    const canvas =
        document.getElementById(
            "topicChart"
        );

    if (!canvas) {
        return;
    }


    const labels =
        Object.keys(topics);

    const scores =
        Object.values(topics);


    /* ---------------------------------
       DESTROY OLD CHART
    --------------------------------- */

    if (topicChart) {

        topicChart.destroy();

        topicChart = null;
    }


    /* ---------------------------------
       EMPTY DATA
    --------------------------------- */

    if (labels.length === 0) {

        return;
    }


    /* ---------------------------------
       CREATE CHART
    --------------------------------- */

    topicChart =
        new Chart(
            canvas,
            {
                type: "bar",

                data: {

                    labels: labels,

                    datasets: [
                        {
                            label:
                                "Average Score",

                            data: scores,

                            borderWidth: 1,

                            borderRadius: 8
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        y: {

                            beginAtZero: true,

                            max: 10,

                            ticks: {
                                stepSize: 2
                            }
                        }
                    },

                    plugins: {

                        legend: {
                            display: false
                        }
                    }
                }
            }
        );
}


/* =========================================
   TOPIC SCORE LIST
========================================= */

function createTopicScores(topics) {

    const container =
        document.getElementById(
            "topicPerformance"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";


    const topicNames =
        Object.keys(topics);


    /* ---------------------------------
       NO DATA
    --------------------------------- */

    if (topicNames.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No topic data available yet.
            </div>
        `;

        return;
    }


    /* ---------------------------------
       CREATE TOPIC CARDS
    --------------------------------- */

    topicNames.forEach(topic => {

        const score =
            Number(topics[topic]) || 0;


        const item =
            document.createElement("div");


        item.className =
            "topic-score-item";


        item.innerHTML = `

            <div class="topic-score-header">

                <strong>
                    ${topic}
                </strong>

                <span>
                    ${score}/10
                </span>

            </div>

            <div class="topic-progress">

                <div
                    class="topic-progress-fill"
                    style="width:${score * 10}%">
                </div>

            </div>

        `;


        container.appendChild(item);

    });
}


/* =========================================
   INSIGHTS
========================================= */

function createInsights(data) {

    const container =
        document.getElementById(
            "insights"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";


    const topics =
        data.topic_performance || {};

    const topicNames =
        Object.keys(topics);


    /* ---------------------------------
       NO INTERVIEW DATA
    --------------------------------- */

    if (
        !data.questions_answered ||
        data.questions_answered === 0
    ) {

        container.innerHTML = `

            <div class="insight-item">

                🎯

                <span>
                    Start your first interview
                    to begin tracking your progress.
                </span>

            </div>

        `;

        return;
    }


    /* ---------------------------------
       QUESTIONS
    --------------------------------- */

    container.innerHTML += `

        <div class="insight-item">

            📝

            <span>
                You have completed
                <strong>
                    ${data.questions_answered}
                </strong>
                interview question${data.questions_answered === 1 ? "" : "s"}.
            </span>

        </div>

    `;


    /* ---------------------------------
       AVERAGE
    --------------------------------- */

    container.innerHTML += `

        <div class="insight-item">

            ⭐

            <span>
                Your current average score is
                <strong>
                    ${data.average_score}/10
                </strong>.
            </span>

        </div>

    `;


    /* ---------------------------------
       BEST TOPIC
    --------------------------------- */

    if (topicNames.length > 0) {

        let highestTopic =
            topicNames[0];

        let highestScore =
            Number(topics[highestTopic]);


        topicNames.forEach(topic => {

            const score =
                Number(topics[topic]);

            if (score > highestScore) {

                highestTopic =
                    topic;

                highestScore =
                    score;
            }

        });


        container.innerHTML += `

            <div class="insight-item">

                🚀

                <span>

                    Your highest current topic score
                    is in

                    <strong>
                        ${highestTopic}
                    </strong>

                    at

                    <strong>
                        ${highestScore}/10
                    </strong>.

                </span>

            </div>

        `;
    }


    /* ---------------------------------
       STREAK
    --------------------------------- */

    container.innerHTML += `

        <div class="insight-item">

            🔥

            <span>

                Your current streak is

                <strong>
                    ${data.current_streak}
                </strong>

                day${data.current_streak === 1 ? "" : "s"}.

            </span>

        </div>

    `;
}


/* =========================================
   START INTERVIEW
========================================= */

function startInterview() {

    window.location.href =
        "index.html";
}


/* =========================================
   LOGOUT
========================================= */

function logout() {

    localStorage.removeItem(
        "user_id"
    );

    localStorage.removeItem(
        "user_name"
    );

    localStorage.removeItem(
        "topic"
    );

    localStorage.removeItem(
        "difficulty"
    );

    localStorage.removeItem(
        "current_question_id"
    );

    localStorage.removeItem(
        "current_question"
    );

    localStorage.removeItem(
        "current_difficulty"
    );

    window.location.href =
        "login.html";
}


/* =========================================
   ACHIEVEMENTS
========================================= */

async function loadAchievements() {

    try {

        const response =
            await fetch(
                `${API}/achievements/${userId}`
            );


        if (!response.ok) {

            throw new Error(
                "Achievement API failed"
            );
        }


        const data =
            await response.json();


        const container =
            document.getElementById(
                "achievementGrid"
            );


        if (!container) {
            return;
        }


        container.innerHTML = "";


        let unlocked = 0;


        const achievements =
            data.achievements || [];


        /* ---------------------------------
           NO ACHIEVEMENTS
        --------------------------------- */

        if (
            achievements.length === 0
        ) {

            container.innerHTML = `

                <div class="empty-state">

                    No achievements available yet.

                </div>

            `;

            return;
        }


        /* ---------------------------------
           CREATE ACHIEVEMENT CARDS
        --------------------------------- */

        achievements.forEach(
            achievement => {

                if (
                    achievement.unlocked
                ) {

                    unlocked++;
                }


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "achievement-card";


                if (
                    achievement.unlocked
                ) {

                    card.classList.add(
                        "unlocked"
                    );

                }
                else {

                    card.classList.add(
                        "locked"
                    );
                }


                card.innerHTML = `

                    <div class="achievement-icon">

                        ${
                            achievement.unlocked
                            ? achievement.icon
                            : "🔒"
                        }

                    </div>

                    <div>

                        <h3>
                            ${achievement.title}
                        </h3>

                        <p>
                            ${achievement.description}
                        </p>

                    </div>

                `;


                container.appendChild(
                    card
                );

            }
        );


        const count =
            document.getElementById(
                "achievementCount"
            );


        if (count) {

            count.innerText =
                `${unlocked} unlocked`;
        }

    }

    catch (error) {

        console.error(
            "Achievement error:",
            error
        );

        const container =
            document.getElementById(
                "achievementGrid"
            );

        if (container) {

            container.innerHTML = `

                <div class="empty-state">

                    Unable to load achievements.

                </div>

            `;
        }
    }
}


/* =========================================
   INTERVIEW HISTORY
========================================= */

async function loadHistory() {

    try {

        const response =
            await fetch(
                `${API}/interview/history/${userId}`
            );


        if (!response.ok) {

            throw new Error(
                "History API failed"
            );
        }


        const data =
            await response.json();


        const container =
            document.getElementById(
                "historyList"
            );


        if (!container) {
            return;
        }


        container.innerHTML = "";


        const history =
            data.history || [];


        /* ---------------------------------
           NO HISTORY
        --------------------------------- */

        if (history.length === 0) {

            container.innerHTML = `

                <div class="empty-state">

                    No interviews completed yet.

                </div>

            `;

            return;
        }


        /* ---------------------------------
           CREATE HISTORY ITEMS
        --------------------------------- */

        history.forEach(item => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "history-item";


            let scoreClass =
                "score-low";


            if (item.score >= 8) {

                scoreClass =
                    "score-high";

            }
            else if (item.score >= 5) {

                scoreClass =
                    "score-medium";
            }


            row.innerHTML = `

                <div class="history-main">

                    <strong>
                        ${item.topic}
                    </strong>

                    <span>
                        ${item.difficulty}
                    </span>

                    <p>
                        ${item.question}
                    </p>

                </div>

                <div class="history-score ${scoreClass}">

                    ${item.score}/10

                </div>

            `;


            container.appendChild(
                row
            );

        });

    }

    catch (error) {

        console.error(
            "History error:",
            error
        );

        const container =
            document.getElementById(
                "historyList"
            );

        if (container) {

            container.innerHTML = `

                <div class="empty-state">

                    Unable to load interview history.

                </div>

            `;
        }
    }
}


/* =========================================
   START EVERYTHING
========================================= */

loadDashboard();

loadAchievements();

loadHistory();