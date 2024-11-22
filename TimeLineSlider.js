// Import jsdom if running in a Node.js environment (optional)
let document, window;
if (typeof window === 'undefined' || typeof document === 'undefined') {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="time-line"></div></body></html>`);
  window = dom.window;
  document = window.document;
}

class TimeLineSlider {
  constructor(options = {}) {
    this.timeLineId = options.timeLineId || "time-line";
    this.timeLineElement = document.getElementById(this.timeLineId);
    if (!this.timeLineElement) {
      console.error(`TimeLineSlider: Element with id '${this.timeLineId}' not found.`);
      return;
    }

    this.lineShape = `<div class="one-line slide-line"></div>`;
    this.specificLineShape = `<div class="specific-line slide-line"></div>`;
    this.lineShapesHtml = '';
    this.startYear = options.startYear || 1010;
    this.endYear = options.endYear || 2100;
    this.step = options.step || 10;
    this.isDragging = false;
    this.slideYears = [];
    this.offsetXx = 0;
    this.activeSlideClass = options.activeSlideClass || 'active';
    this.specialStep = options.specialStep || 100;

    this.generateTimeLine();
    this.addDraggableElement();

    this.allSlides = document.querySelectorAll('[slide-year]');
    this.collectSlideYears();
    this.addEventListeners();
  }

  addDraggableElement() {
    if (!this.draggableElement) return;

    const startDrag = (e) => {
      e.preventDefault();
      this.isDragging = true;
      this.draggableElement.classList.remove('translate');
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      this.offsetXx = clientX - this.draggableElement.getBoundingClientRect().left;
      this.draggableElement.classList.add('dragging');
    };

    const moveDrag = (e) => {
      if (!this.isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const x = clientX - this.offsetXx;
      const containerRect = this.timeLineElement.getBoundingClientRect();
      const imgRect = this.draggableElement.getBoundingClientRect();

      if (x >= this.timeLineElement.offsetLeft && (x + imgRect.width) <= containerRect.right) {
        this.draggableElement.style.left = `${x - this.timeLineElement.offsetLeft}px`;
      }
    };

    const endDrag = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.draggableElement.classList.remove('dragging');
      this.draggableElement.classList.add('translate');
      this.handleMouseUp();
    };

    this.draggableElement.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('mouseup', endDrag);

    this.draggableElement.addEventListener('touchstart', startDrag);
    document.addEventListener('touchmove', moveDrag);
    document.addEventListener('touchend', endDrag);
  }

  handleMouseUp() {
    // Snapping logic...
  }

  collectSlideYears() {
    this.allSlides.forEach(slide => {
      this.slideYears.push(slide.getAttribute('slide-year'));
    });
  }

  addEventListeners() {
    this.allSlides.forEach((slide) => {
      slide.addEventListener('click', () => {
        this.translateToYear(slide.getAttribute('slide-year'));
      });
    });
  }

  translateToYear(year) {
    const targetDiv = document.getElementById(year);
    const activeSlide = document.querySelector(`[slide-year="${year}"]`);
    if (activeSlide) {
      this.allSlides.forEach((e) => e.classList.remove(this.activeSlideClass));
      activeSlide.classList.add(this.activeSlideClass);
    }
    if (targetDiv) {
      const targetRect = targetDiv.offsetLeft;
      this.draggableElement.classList.add("translate");
      this.draggableElement.style.left = `${targetRect - this.draggableElement.offsetWidth / 2}px`;
    } else {
      console.error('Target div not found');
    }
  }

  generateTimeLine(s = this.startYear, e = this.endYear, step = this.step) {
    if (!this.timeLineElement) return;
    this.lineShapesHtml = '';
    for (let i = s; i <= e; i += step) {
      this.lineShapesHtml += i % this.specialStep === 0
        ? `<div id="${i}" class="specific-line slide-line"></div>`
        : `<div id="${i}" class="one-line slide-line"></div>`;
    }
    const imsElementHtml = `<div id="draggable"><div class="inner"></div></div>`;
    this.timeLineElement.innerHTML = `<div class="lines">${this.lineShapesHtml}</div>${imsElementHtml}`;
    this.draggableElement = document.getElementById('draggable');
    this.addDraggableElement();
  }

  setStartEnd(s, e) {
    this.startYear = s;
    this.endYear = e;
    this.generateTimeLine(s, e, this.step);
  }

  setStep(step) {
    this.step = step;
    this.generateTimeLine(this.startYear, this.endYear, step);
  }

  setActiveSlideClass(className) {
    this.activeSlideClass = className;
    this.generateTimeLine();
  }

  setSpecialStep(specialStep) {
    this.specialStep = specialStep;
    this.generateTimeLine();
  }
}

// Export for Node.js
module.exports = TimeLineSlider;
