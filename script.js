const slides = document.querySelector(".slides");
const slideElements = document.querySelectorAll(".slide");

const prevButton = document.querySelector(".prev-button");
const nextButton = document.querySelector(".next-button");

const currentNumber = document.querySelector("#currentNumber");
const totalNumber = document.querySelector("#totalNumber");

const dotsContainer = document.querySelector("#dots");

const maxVisibleDots = 5;

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

  updateDots();
  stopAudio();
}

/*
|--------------------------------------------------------------------------
| Dots
|--------------------------------------------------------------------------
*/

function updateDots() {
  dotsContainer.innerHTML = "";

  const visibleDots = Math.min(totalSlides, maxVisibleDots);

  let startIndex = currentSlide - 2;

  // В начале показываем точки 1–5
  if (startIndex < 0) {
    startIndex = 0;
  }

  // В конце показываем последние 5 точек
  if (startIndex > totalSlides - visibleDots) {
    startIndex = totalSlides - visibleDots;
  }

  for (let i = 0; i < visibleDots; i++) {
    const dot = document.createElement("span");
    dot.classList.add("dot");

    const slideIndex = startIndex + i;

    if (slideIndex === currentSlide) {
      dot.classList.add("active");
    }

    dotsContainer.appendChild(dot);
  }
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

/*
|--------------------------------------------------------------------------
| Предзагрузка длительности аудио
|--------------------------------------------------------------------------
*/

const audioDurations = [];

audioFiles.forEach((src, index) => {
  const preloadAudio = new Audio();

  preloadAudio.src = src;
  preloadAudio.preload = "metadata";

  preloadAudio.addEventListener("loadedmetadata", () => {
    audioDurations[index] = preloadAudio.duration;

    const player = players[index];

    if (!player) {
      return;
    }

    const duration = player.querySelector(".duration");

    duration.textContent = formatTime(preloadAudio.duration);
  });
});

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

const slider = document.querySelector(".slider");

let touchStartX = 0;
let touchStartY = 0;

const swipeThreshold = 40;

slider.addEventListener(
  "touchstart",
  (event) => {
    const touch = event.touches[0];

    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  },
  { passive: true },
);

slider.addEventListener(
  "touchend",
  (event) => {
    const touch = event.changedTouches[0];

    const differenceX = touch.clientX - touchStartX;

    const differenceY = touch.clientY - touchStartY;

    /*
     * Игнорируем вертикальный скролл.
     */

    if (Math.abs(differenceY) > Math.abs(differenceX)) {
      return;
    }

    /*
     * Игнорируем слишком короткое движение.
     */

    if (Math.abs(differenceX) < swipeThreshold) {
      return;
    }

    /*
     * Влево → следующая карточка
     * Вправо → предыдущая карточка
     */

    if (differenceX < 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  },
  { passive: true },
);

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
