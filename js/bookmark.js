/*
  Script modified from "The Web Flash": https://goo.gl/J7qRme
*/
var bookmarkPage = function (e, elem, displayMessage) {
  var bookmarkURL = window.location.href;
  var bookmarkTitle = document.title;

  if (window.sidebar && window.sidebar.addPanel) {
    // Firefox <=22
    window.sidebar.addPanel(bookmarkTitle, bookmarkURL, '');
  } else if ((window.sidebar && /Firefox/i.test(navigator.userAgent)) || (window.opera && window.print)) {
    // Firefox 23+ and Opera <=14
    $(elem).attr({
      href: bookmarkURL,
      title: bookmarkTitle,
      rel: 'sidebar'
    }).off(e);
    return true;
  } else if (window.external && ('AddFavorite' in window.external)) {
    // IE Favorites
    window.external.AddFavorite(bookmarkURL, bookmarkTitle);
  } else {
    // Other browsers (mainly WebKit & Blink - Safari, Chrome, Opera 15+)
    displayMessage('Press ' + (/Mac/i.test(navigator.userAgent) ? 'Cmd' : 'Ctrl') + '+D to bookmark this page.');
  }
  return false;
}