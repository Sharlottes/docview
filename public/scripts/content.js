function findClickedWord(nodes, x, y) {
  let parentElt;

  for (const node of nodes) {
    if (node?.nodeName === '#text') {
      parentElt = node;
      break;
    }
  }
  if (!parentElt) return;

  const range = document.createRange();
  const words = parentElt.textContent.split(' ');
  let start = 0, end = 0;
  for (const word of words) {
    end = start + word.length;
    range.setStart(parentElt, start);
    range.setEnd(parentElt, end);
    // not getBoundingClientRect as word could wrap
    const rects = range.getClientRects();
    const clickedRect = isClickInRects(rects);
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

  const body = document.querySelector('body');
  const elt = document.createElement('div');
  elt.id = 'docview-injected-element';
  elt.innerHTML = '<div></div>';
  elt.setAttribute('style', `
    position: absolute; 
    inset: 0;
    width: 160px;
    height: fit-content;
    padding: 10px;
    border-radius: 10px;
    background-color: white;
    box-shadow: 0 0 2px black;
    color: black;
  `)
  body.appendChild(elt);

  return elt;
}

async function onClick(e) {
  const elt = findDocviewElement();
  if (e.target === elt) return;

  const clicked = findClickedWord(e.target.childNodes, e.clientX, e.clientY);
  elt.style.display = clicked ? 'block' : 'none';
  if (!clicked) return;

  const [word, , r] = clicked;
  const { title, link, description } = await requestEncycAPI(word);

  elt.style.transform = `translateX(${window.scrollX + r.left}px) translateY(${window.scrollY + r.top + 50}px)`
  elt.querySelector('#docview-injected-element > div').innerHTML = `
    ${word}
    <div style='width: 100%; height: 1px; background-color: rgba(0, 0, 0, 0.3); margin: 5px 0px'></div>
    <strong>${title}</strong><br/><br/>  
    <a href=${link} style='text-decoration: none;color: inherit;'>
      ${description}
    </a>
  `;
}

document.addEventListener('click', onClick);