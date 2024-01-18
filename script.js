const progressBar = document.querySelector('.progress-bar'),
	progressText = document.querySelector('.progress-text'),
	startBtn = document.querySelector('.start-btn'),
	nextBtn = document.querySelector('.next-btn'),
	submitBtn = document.querySelector('.submit-btn'),
	numQuestions = document.querySelector('#numOfQuestions'),
	category = document.querySelector('#category'),
	difficulty = document.querySelector('#difficulty'),
	timePerQuestion = document.querySelector('#timePerQuestion'),
	quiz = document.querySelector('.quiz'),
	startScreen = document.querySelector('.start-screen');

let time,
	score = 0,
	questions = [],
	timer,
	currentQuestion;

const progress = value => {
	const precentage = (value / time) * 100;
	progressBar.style.width = `${precentage}%`;
	progressText.textContent = `${value}`;
};

const startQuiz = async () => {
	const num = numQuestions.value,
		cat = category.value,
		diff = difficulty.value;
	// api

	const url = `https://opentdb.com/api.php?amount=${num}&category=${cat}&difficulty=${diff}&type=multiple`;
	const response = await fetch(url);
	const data = await response.json();
	questions = data.results;
	// show questions
	startScreen.classList.add('hidden');
	quiz.classList.remove('hidden');
	currentQuestion = 1;
	showQuestion(questions[0]);
};

startBtn.addEventListener('click', startQuiz);

const startTimer = t => {
	timer = setInterval(() => {
		if (t >= 0) {
			progress(t);
			t--;
		} else {
			clearInterval(timer);
			checkAnswers();
		}
	}, 1000);
};

const showQuestion = q => {
	const questionText = document.querySelector('.question'),
		answersWrapper = document.querySelector('.answer-wrapper'),
		questionNum = document.querySelector('.number');
	// replace html entities in question
	const questionTextStr = q.question
		.replace(/&quot;/g, '"')
		.replace(/&#039;/g, "'");

	questionText.textContent = questionTextStr;

	// randomize answers order
	const answers = [...q.incorrect_answers, q.correct_answer];

	answers.sort(() => Math.random() - 0.5);

	answersWrapper.innerHTML = '';
	answers.forEach(answer => {
		// replace html entities in answers
		const answerText = answer
			.replace(/&quot;/g, '"')
			.replace(/&#039;/g, "'");

		answersWrapper.innerHTML += `
        <div class="answer">
        <span class="text">${answerText.trim()}</span>
        <span class="checkbox">
        <span class="icon">
		<i class="fas fa-check"></i>
		</span>
        </span>
        </div>`;
	});

	questionNum.innerHTML = `<p>
	Question <span class="current">
	${questions.indexOf(q) + 1}
	</span><span class="total"> of
	${questions.length}
	</span>
	</p>`;

	const answersDiv = document.querySelectorAll('.answer');

	answersDiv.forEach(answer => {
		answer.addEventListener('click', () => {
			if (!answer.classList.contains('selected')) {
				answersDiv.forEach(answer => {
					answer.classList.remove('selected');
				});
			} else {
				if (answer.classList.contains('selected')) {
					return;
				}
			}

			answer.classList.add('selected');

			submitBtn.removeAttribute('disabled');
		});
	});

	time = timePerQuestion.value;
	startTimer(time);
};

const checkAnswers = () => {
	clearInterval(timer);
	const selectedAnswer = document.querySelector('.answer.selected');
	if (selectedAnswer) {
		const answer = selectedAnswer.querySelector('.text');
		if (answer.textContent === questions[currentQuestion - 1].correct_answer) {
			console.log("correct");
			selectedAnswer.classList.add('correct');
			score++;
		} else {
			selectedAnswer.classList.add('wrong');
			const correctAnswers = document.querySelectorAll('.answer');
			correctAnswers.forEach(answer => {
				if (
					answer.querySelector('.text').innerHTML ===
					questions[currentQuestion - 1].correct_answer
				) {
					answer.classList.add('correct');
				}
			});
		}
	} else {
		getAnswers();
	}

	const asnwerDivs = document.querySelectorAll('.answer');
	asnwerDivs.forEach(answer => {
		answer.classList.add('selected');
	});

	submitBtn.style.display = 'none';
	nextBtn.style.display = 'block';
};
const getAnswers = () => {
	const correctAnswers = document.querySelectorAll('.answer');
	correctAnswers.forEach(answer => {
		//disable clicking on answers
		if (
			answer.querySelector('.text').innerHTML ===
			questions[currentQuestion - 1].correct_answer
		) {
			answer.classList.add('correct');
		} else if (
			answer.querySelector('.text').innerHTML !==
			questions[currentQuestion - 1].correct_answer
		) {
			answer.classList.add('wrong');
		}
	});
};

submitBtn.addEventListener('click', checkAnswers);

nextBtn.addEventListener('click', () => {
	nextQuestion();
});

const nextQuestion = () => {
	if (currentQuestion < questions.length) {
		currentQuestion++;
		nextBtn.style.display = 'none';
		submitBtn.style.display = 'block';
		submitBtn.setAttribute('disabled', true);
		showQuestion(questions[currentQuestion - 1]);
	} else {
		showScore();
	}
};

const showScore = () => {
	const endScreen = document.querySelector('.end-screen');
	endScreen.classList.remove('hidden');
	quiz.classList.add('hidden');
	const finalScore = document.querySelector('.final-score');
	finalScore.innerHTML = score;
	const totalScore = document.querySelector('.total-score');
	totalScore.innerHTML = ` / ${questions.length}`;
};

const restartBtn = document.querySelector('.restart-btn');

restartBtn.addEventListener('click', () => {
	const endScreen = document.querySelector('.end-screen');
	score = 0;
	location.reload();
})