const loginBtn = document.querySelector(".loginbtn"),
formSection = document.querySelector(".form"),
homeSection = document.querySelector(".home"),
footerSection = document.querySelector(".footer");

loginBtn.addEventListener("click", () => {
    formSection.classList.add("active");
    homeSection.classList.add("wrapp-blur");
    footerSection.classList.add("wrapp-blur");
});


formSection.addEventListener("click", function(event) {
    const clickEvent = event.target;
    if (!clickEvent.closest(".search-box")) {
      formSection.classList.remove("active");
      homeSection.classList.remove("wrapp-blur");
      footerSection.classList.remove("wrapp-blur");
    }
});


// test size màn hình
function updateScreenSize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  document.getElementById("size-info").textContent = `Kích thước màn hình: ${width}px x ${height}px`;
}

window.onload = updateScreenSize;
window.onresize = updateScreenSize;