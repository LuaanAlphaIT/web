// ẩn hiện bars theo size
const bars = document.querySelector(".bar"),
close = document.querySelector(".close"),
menu = document.querySelector(".menu");

bars.addEventListener("click", () => {
    menu.classList.add("active");
    gsap.from(".menu", {
        opacity: 0,
        duration: .3
    })

    gsap.from(".menu ul", {
        opacity: 0,
        x: -300
    })
});

close.addEventListener("click", () => {
    menu.classList.remove("active")
});

// blur
const search = document.querySelector(".search"), 
searchBottomPart = document.querySelector(".bottom-part"),
hiddenSearchSection = document.querySelector(".hidden-search"),
homeSection = document.querySelector(".home");


searchBottomPart.addEventListener("click", () => {
  search.classList.add("inactive");
  hiddenSearchSection.classList.add("active");
  homeSection.classList.add("wrapp-blur");
});

hiddenSearchSection.addEventListener("click", function(event) {
  const clickEvent = event.target;
  if (!clickEvent.closest(".search-box")) {
    search.classList.remove("inactive");
    hiddenSearchSection.classList.remove("active");
    homeSection.classList.remove("wrapp-blur");
  }
});


// ticket type label
const labels = document.querySelectorAll('.custom-label');

labels.forEach(function(label) {
    label.addEventListener('click', function() {
        labels.forEach(function(l) {
            l.classList.remove("active");
        });
        label.classList.add("active");
    });
});


// dropdown
const dropdowns = document.querySelectorAll('.dropdown-container');

dropdowns.forEach(dropdown => {
    const preFace = dropdown.parentElement.querySelector('.pre-face');

    preFace.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-container').forEach(d => {
            if (d !== dropdown) d.classList.remove('active');
        });
        dropdown.classList.toggle('active');
    });
});


document.addEventListener('click', (event) => {
    if (!event.target.closest('.information')) {
        dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
    }
});

const fromLocationList = document.getElementById('from-location-list');
const fromLocationLabel = document.getElementById('from-location-label');
fromLocationList.querySelectorAll('li').forEach(item => {
    item.addEventListener('click', (event) => {
        fromLocationLabel.textContent = item.textContent;
        fromLocationList.classList.remove('active');
    });
});

const toLocationList = document.getElementById('to-location-list');
const toLocationLabel = document.getElementById('to-location-label');
toLocationList.querySelectorAll('li').forEach(item => {
    item.addEventListener('click', (event) => {
        toLocationLabel.textContent = item.textContent;
        toLocationList.classList.remove('active');
    });
});


// number customer
// Lấy các phần tử cần thao tác
const incrementButton = document.getElementById("increment");
const decrementButton = document.getElementById("decrement");
const passengerLabel = document.getElementById("passenger-count");
let passengerCount = 1;
function updatePassengerLabel() {
    passengerLabel.textContent = `${passengerCount} Hành Khách`;
}
incrementButton.addEventListener("click", () => {
    passengerCount++;
    updatePassengerLabel();
});
decrementButton.addEventListener("click", () => {
    if (passengerCount > 1) {
        passengerCount--;
        updatePassengerLabel();
    }
});


// animation
function animateContent(selector) {
    selector.forEach((selector) => {
        gsap.to(selector, {
            y: 30,
            duration: 0.1,
            opacity: 1,
            delay: 0.2,
            stagger: 0.2,
            ease: "power2.out",
        });
    });
}

function scrollTirggerAnimation(triggerSelector, boxSelectors) {
    const timeline = gsap.timeline({
        scrollTrigger: {
            trigger: triggerSelector,
            start: "top 50%",
            end: "top 80%",
            scrub: 1,
        },
    });

    boxSelectors.forEach((boxSelector) => {
        timeline.to(boxSelector, {
            y: 0,
            duration: 1,
            opacity: 1,
        });
    })
}

function swipeAnimation(triggerSelector, boxSelectors) {
    const timeline = gsap.timeline({
        scrollTrigger: {
            trigger: triggerSelector,
            start: "top 50%",
            end: "top 100%",
            scrub: 3,
        },
    });

    boxSelectors.forEach((boxSelector) => {
        timeline.to(boxSelector, {
            x: 0,
            duration: 1,
            opacity:1,
        });
    });
}

function galleryAnimation(triggerSelector, boxSelectors) {
    const timeline = gsap.timeline({
        scrollTrigger: {
            trigger: triggerSelector,
            start: "top 100%",
            end: "bottom 100%",
            scrub: 1,
        },
    });

    boxSelectors.forEach((boxSelector) => {
        timeline.to(boxSelector, {
            y: 0,
            opacity: 1,
            duration: 1,
        });
    });
}




animateContent([".home .content h1, .home .content p, .home .content .search"]);

scrollTirggerAnimation(".feedback .container", [".feedback .label", ".feedback .heading", ".feedback .paragraph"]);

// scrollTirggerAnimation(".article", [".article .label", ".article .heading"]);

swipeAnimation(".destinations", [".destinations .heading", ".destinations .content"])

// swipeAnimation(".article", [".article .latest-article", ".article .box1", ".article .box2", ".article .box3", ".article .box4"])

galleryAnimation(".destinations .gallery", [".destinations .gallery .box1",".destinations .gallery .box2",".destinations .gallery .box3",".destinations .gallery .box4",".destinations .gallery .box5"])

galleryAnimation(".featured .gallery", [".featured .gallery .box1",".featured .gallery .box2",".featured .gallery .box3",".featured .gallery .box4"])

galleryAnimation(".feedback .voices", [".feedback .voices .box1",".feedback .voices .box2",".feedback .voices .box3",".feedback .voices .box4",".feedback .voices .box5",".feedback .voices .box6"])
