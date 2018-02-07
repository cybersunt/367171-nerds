ymaps.ready(init);

function init() {
  hideImageMap();

  var map = new ymaps.Map('map', {
    center: [59.93895578, 30.32133946],
    zoom: 17,
    controls: ['zoomControl'],
    behaviors: ['drag']
  });

  var placemark = new ymaps.Placemark(['59.93871891', '30.32291660'], {
    hintContent: 'Офис компании по адресу ул. Большая Конюшенная 19/8, Санкт-Петербург',
    balloonContent: 'Офис компании по адресу ул. Большая Конюшенная 19/8, Санкт-Петербург'
  },
  {
    iconLayout: 'default#image',
    iconImageHref: '../img/decoration/map-pin.png',
    iconImageSize: [231, 190],
    iconImageOffset: [-49, -190],
  });

  map.geoObjects.add(placemark);
}

function hideImageMap () {
  document.querySelector('.contacts__map-img').classList.add('contacts__map-img--hidden');
}
