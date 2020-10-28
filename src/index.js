import $ from 'jquery';

import 'normalize.css';
import './styles.css';


function main() {
  console.log('DOM is loaded');

  const startMsg = $('<p>Webpack is working!</p>');
  $('main').append(startMsg);
}

$(main);