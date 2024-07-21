function toggle() {
  element = document.getElementById("toggle");
  if (element.classList.contains("toggle-open")) {
    element.classList.remove("toggle-open");
    element.classList.add("toggle-close");
  } else {
    element.classList.remove("toggle-close");
    element.classList.add("toggle-open");
  }
}
