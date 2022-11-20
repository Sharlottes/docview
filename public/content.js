function findClickedWord(parentElt, x, y) {
  if (!(parentElt && parentElt.nodeName === '#text')) return;

  var range = document.createRange();
  var words = parentElt.textContent.split(' ');
  var start = 0;
  var end = 0;
  for (var i = 0; i < words.length; i++) {
    var word = words[i];
    end = start + word.length;
    range.setStart(parentElt, start);
    range.setEnd(parentElt, end);
    // not getBoundingClientRect as word could wrap
    var rects = range.getClientRects();
    var clickedRect = isClickInRects(rects);
    if (clickedRect) {
      return [word, start, clickedRect];
    }
    start = end + 1;
  }

  function isClickInRects(rects) {
    for (var i = 0; i < rects.length; ++i) {
      var r = rects[i]
      if (r.left < x && r.right > x && r.top < y && r.bottom > y) {
        return r;
      }
    }
    return false;
  }
  return null;
}

function requestEncycAPI(word) {
  return fetch(`https://sharjects-sharlottes.vercel.app/api/naver/search/encyc?word=${word}`)
    .then(res => res.json())
    .then(data => data.items[0])
}

function findDocviewElement() {
  const element = document.querySelector('#docview-injected-element');
  if (element) return element;

  const elt = document.createElement('div');
  elt.id = 'docview-injected-element';
  const box = document.createElement('div');
  box.id = 'docview-word-wrapper';
  elt.appendChild(box);
  document.querySelector('body').appendChild(elt);
  return elt;
}

const boxStyle = r => `
    position: absolute; 
    inset: 0; 
    transform: translateX(${r?.left + window.scrollX}px) translateY(${r?.top + window.scrollY + 50}px);
    width: 160px;
    height: fit-content;
    border-radius: 10px;
    background-color: white;
    box-shadow: 0 0 2px black;
  ` + (r === undefined ? 'display: none;' : 'display: block;')

function onClick(e) {
  const elt = findDocviewElement();
  const clicked = findClickedWord(Object.values(e.target.childNodes).find(node => node?.nodeName === '#text'), e.clientX, e.clientY);
  elt.setAttribute('style', boxStyle())
  if (!clicked) return;
  const [word, start, r] = clicked;
  elt.setAttribute('style', boxStyle(r))
  const wrapper = elt.querySelector('#docview-word-wrapper');
  wrapper.innerHTML = word +
    `<div style='width: 100%; height: 1px; background-color: rgba(0, 0, 0, 0.3); margin: 5px 0px'></div>`;
  requestEncycAPI(word).then(({ title, link, description }) => {
    wrapper.innerHTML += `
      <strong>${title}</strong><br/><br/>  
      <a href=${link} style='text-decoration: none;color: inherit;'>
        ${description}
      </a>`;
  });

  console.log('Clicked: (' + r.top + ',' + r.left + ') word:' + word + ' at offset ' + start);
}

document.addEventListener('click', onClick);
