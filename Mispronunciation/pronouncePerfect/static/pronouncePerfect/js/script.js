document.getElementById("speak-button").addEventListener("click", function () {
    const wordBox = document.getElementById("word-box");
    if (wordBox.classList.contains("hidden")) {
      wordBox.classList.remove("hidden");
    } else {
      wordBox.classList.add("hidden");
    }
  });
  