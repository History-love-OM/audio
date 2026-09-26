const slides = document.querySelector(".slides");
const slideElements = document.querySelectorAll(".slide");

const prevButton = document.querySelector(".prev-button");
const nextButton = document.querySelector(".next-button");

const currentNumber = document.querySelector("#currentNumber");
const totalNumber = document.querySelector("#totalNumber");

const dots = document.querySelectorAll(".dot");

const totalSlides = slideElements.length;

let currentSlide = 0;

let startX = 0;
let currentX = 0;
let isDragging = false;

/*
|--------------------------------------------------------------------------
| Аудиофайлы
|--------------------------------------------------------------------------
|
| Здесь указываем реальные файлы.
|
| Например:
|
| audio/01.mp3
| audio/02.mp3
|
*/

const audioFiles = [
  "audio/0.mp3",
  "audio/1.mp3",
  "audio/2.mp3",
  "audio/3.mp3",
  "audio/4.mp3",
  "audio/5.mp3",
  "audio/6.mp3",
  "audio/7.mp3",
  "audio/8.mp3",
  "audio/9.mp3",
  "audio/10.mp3",
];

let audio = new Audio();

let currentAudioIndex = -1;

/*
|--------------------------------------------------------------------------
| Формат времени
|--------------------------------------------------------------------------
*/

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);

  const remainingSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

/*
|--------------------------------------------------------------------------
| Обновление слайда
|--------------------------------------------------------------------------
*/

function updateSlider() {
  slides.style.transform = `translateX(-${currentSlide * 100}%)`;

  currentNumber.textContent = String(currentSlide + 1).padStart(2, "0");

  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentSlide);
  });

  stopAudio();
}

/*
|--------------------------------------------------------------------------
| Следующий слайд
|--------------------------------------------------------------------------
*/

function nextSlide() {
  if (currentSlide < totalSlides - 1) {
    currentSlide++;

    updateSlider();
  }
}

/*
|--------------------------------------------------------------------------
| Предыдущий слайд
|--------------------------------------------------------------------------
*/

function prevSlide() {
  if (currentSlide > 0) {
    currentSlide--;

    updateSlider();
  }
}

/*
|--------------------------------------------------------------------------
| Кнопки
|--------------------------------------------------------------------------
*/

nextButton.addEventListener("click", nextSlide);

prevButton.addEventListener("click", prevSlide);

/*
|--------------------------------------------------------------------------
| Аудиоплееры
|--------------------------------------------------------------------------
*/

const players = document.querySelectorAll(".player");

players.forEach((player, index) => {
  const button = player.querySelector(".play-button");

  const progress = player.querySelector(".progress");

  const progressContainer = player.querySelector(".progress-container");

  const currentTime = player.querySelector(".current-time");

  const duration = player.querySelector(".duration");

  button.addEventListener("click", () => {
    if (currentAudioIndex === index) {
      if (audio.paused) {
        audio.play();

        setPlayingState(player, true);
      } else {
        audio.pause();

        setPlayingState(player, false);
      }

      return;
    }

    stopAudio();

    currentAudioIndex = index;

    audio.src = audioFiles[index];

    audio.load();

    audio.play();

    setPlayingState(player, true);
  });

  progressContainer.addEventListener("click", (event) => {
    if (currentAudioIndex !== index || !audio.duration) {
      return;
    }

    const rect = progressContainer.getBoundingClientRect();

    const clickPosition = event.clientX - rect.left;

    const percentage = clickPosition / rect.width;

    audio.currentTime = percentage * audio.duration;
  });

  audio.addEventListener("loadedmetadata", () => {
    if (currentAudioIndex !== index) {
      return;
    }

    duration.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("timeupdate", () => {
    if (currentAudioIndex !== index) {
      return;
    }

    const percentage = (audio.currentTime / audio.duration) * 100;

    progress.style.width = `${percentage}%`;

    currentTime.textContent = formatTime(audio.currentTime);
  });
});

/*
|--------------------------------------------------------------------------
| Состояние Play / Pause
|--------------------------------------------------------------------------
*/

function setPlayingState(player, isPlaying) {
  const playIcon = player.querySelector(".play-icon");

  const pauseIcon = player.querySelector(".pause-icon");

  playIcon.style.display = isPlaying ? "none" : "block";

  pauseIcon.style.display = isPlaying ? "block" : "none";
}

/*
|--------------------------------------------------------------------------
| Остановка аудио
|--------------------------------------------------------------------------
*/

function stopAudio() {
  if (currentAudioIndex === -1) {
    return;
  }

  audio.pause();

  audio.currentTime = 0;

  const player = players[currentAudioIndex];

  const progress = player.querySelector(".progress");

  const currentTime = player.querySelector(".current-time");

  progress.style.width = "0%";

  currentTime.textContent = "0:00";

  setPlayingState(player, false);

  currentAudioIndex = -1;
}

/*
|--------------------------------------------------------------------------
| Когда аудио закончилось
|--------------------------------------------------------------------------
*/

audio.addEventListener("ended", () => {
  if (currentAudioIndex === -1) {
    return;
  }

  const player = players[currentAudioIndex];

  setPlayingState(player, false);

  /*
   * После окончания записи
   * автоматически переходим к следующей.
   */

  if (currentSlide < totalSlides - 1) {
    setTimeout(() => {
      nextSlide();
    }, 700);
  }
});

/*
|--------------------------------------------------------------------------
| TOUCH / SWIPE
|--------------------------------------------------------------------------
*/

slides.addEventListener(
  "touchstart",
  (event) => {
    startX = event.touches[0].clientX;

    isDragging = true;
  },
  { passive: true },
);

slides.addEventListener(
  "touchmove",
  (event) => {
    if (!isDragging) {
      return;
    }

    currentX = event.touches[0].clientX;
  },
  { passive: true },
);

slides.addEventListener("touchend", () => {
  if (!isDragging) {
    return;
  }

  const difference = startX - currentX;

  const threshold = 60;

  if (Math.abs(difference) > threshold) {
    if (difference > 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  }

  isDragging = false;
});

/*
|--------------------------------------------------------------------------
| Клавиатура
|--------------------------------------------------------------------------
*/

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    nextSlide();
  }

  if (event.key === "ArrowLeft") {
    prevSlide();
  }
});

/*
|--------------------------------------------------------------------------
| Инициализация
|--------------------------------------------------------------------------
*/

totalNumber.textContent = String(totalSlides).padStart(2, "0");

updateSlider();
