var slides = document.querySelectorAll('.slider__item');
var currentSlide = 0;
var interval = 3000;

setInterval(nextSlide, interval);

function nextSlide() {
  slides[currentSlide].classList.remove('slider__item--active');
  currentSlide = (currentSlide + 1)%slides.length;
  slides[currentSlide].classList.add('slider__item--active');
}