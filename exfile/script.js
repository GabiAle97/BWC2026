(function () {
  const pages = Array.from(document.querySelectorAll(".page"));
  const arrowLeft = document.getElementById("arrowLeft");
  const arrowRight = document.getElementById("arrowRight");
  const indicator = document.getElementById("pageIndicator");
  const exitPrompt = document.querySelector(".exit-prompt");

  // PLACEHOLDER: cambiar por la URL final si es necesario
  const EXIT_URL = "https://gabiale97.github.io/BWC2026";
  const pageSound = new Audio("page.mp3");
  const cancelSound = new Audio("cancel.wav");
  const mainTheme = new Audio("main.mp3");
  mainTheme.loop = true;

  let current = 0;

  function startMainTheme() {
    mainTheme.play().then(() => {
      document.removeEventListener("keydown", startMainTheme);
      document.removeEventListener("click", startMainTheme);
    }).catch(() => {
      // el navegador bloqueó el autoplay: seguirá esperando la próxima interacción
    });
  }

  // intento inmediato: algunos navegadores permiten autoplay con sonido si el sitio ya tiene "engagement"
  startMainTheme();
  // si el intento fue bloqueado, arranca en la primera interacción
  document.addEventListener("keydown", startMainTheme);
  document.addEventListener("click", startMainTheme);

  function playPageSound() {
    pageSound.currentTime = 0;
    pageSound.play();
  }

  function render() {
    pages.forEach((page, index) => {
      page.classList.toggle("active", index === current);
      page.classList.toggle("prev", index < current);
    });

    indicator.textContent = `${current + 1} / ${pages.length}`;

    arrowLeft.classList.toggle("hidden", current === 0);
    arrowRight.classList.toggle("hidden", current === pages.length - 1);

    if (current === pages.length - 1) {
      // preventScroll: evita que el foco fuerce un desplazamiento mientras la página aún está deslizándose
      exitPrompt.focus({ preventScroll: true });
    }
  }

  function goNext() {
    if (current < pages.length - 1) {
      current++;
      playPageSound();
      render();
    }
  }

  function goPrev() {
    if (current > 0) {
      current--;
      playPageSound();
      render();
    }
  }

  function exit() {
    cancelSound.currentTime = 0;
    cancelSound.play();
    // espera a que termine el sonido antes de redirigir
    cancelSound.addEventListener("ended", () => {
      window.location.href = EXIT_URL;
    }, { once: true });
  }

  arrowRight.addEventListener("click", goNext);
  arrowLeft.addEventListener("click", goPrev);
  exitPrompt.addEventListener("click", exit);

  document.addEventListener("keydown", (e) => {
    const onLastPage = current === pages.length - 1;

    if (e.key === "ArrowRight") {
      if (onLastPage) {
        exit();
      } else {
        goNext();
      }
    } else if (e.key === "ArrowLeft") {
      goPrev();
    } else if (e.key === "Enter" && onLastPage) {
      exit();
    }
  });

  render();
})();
