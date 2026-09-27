const API =
    "http://127.0.0.1:8000";


const topic =
    localStorage.getItem("topic");


const difficulty =
    localStorage.getItem("difficulty");


async function prepareInterview() {

    if (!topic || !difficulty) {

        window.location.href =
            "index.html";

        return;

    }


    localStorage.setItem(
        "current_difficulty",
        difficulty
    );


    try {

        const response =
            await fetch(
                `${API}/rag/question?` +
                `topic=${encodeURIComponent(topic)}` +
                `&difficulty=${encodeURIComponent(difficulty)}`
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.question
        ) {

            throw new Error(
                "Question generation failed"
            );

        }


        localStorage.setItem(
            "current_question_id",
            data.question_id
        );


        localStorage.setItem(
            "current_question",
            data.question
        );


        window.location.href =
            "interview.html";

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to prepare the interview."
        );

        window.location.href =
            "index.html";

    }

}


prepareInterview();