/* eslint-env browser */
import inView from 'element-in-view';
import throttle from 'lodash.throttle';

const attr = 'data-fortnight-view';

const getPendingElements = () => document.querySelectorAll(`[${attr}="pending"]`);

const loadBeacon = (node) => {
  if (inView(node)) {
    node.setAttribute(attr, 'sent');
    const src = node.getAttribute('data-fortnight-beacon');
    if (src) {
      const a = document.createElement('a');
      a.href = src;
      const now = Date.now();
      const qs = (a.search) ? `${a.search}&_=${now}` : `?_=${now}`;
      a.search = qs;
      const img = document.createElement('img');
      img.src = a.href;
    }
  }
};

const handler = throttle(() => {
  /**
   * Find all in-view, pending elements and send
   */
  const elements = getPendingElements();
  for (let i = 0; i < elements.length; i += 1) {
    const element = elements[i];
    loadBeacon(element);
  }
}, 200);

document.addEventListener('DOMContentLoaded', () => {
  /**
   * On initial page load, find all pending elements and load the beacon, if in view.
   */
  const elements = getPendingElements();
  for (let i = 0; i < elements.length; i += 1) {
    const element = elements[i];
    loadBeacon(element);
  }

  if (window.MutationObserver) {
    /**
     * When new nodes are added, check for pending attribute.
     * If in-view, fire.
     */
    new MutationObserver((mutations) => {
      for (let n = 0; n < mutations.length; n += 1) {
        const mutation = mutations[n];
        if (mutation.type === 'childList') {
          for (let a = 0; a < mutation.addedNodes.length; a += 1) {
            const node = mutation.addedNodes[a];
            if (node.nodeType === 1 && node.getAttribute(attr) === 'pending') {
              loadBeacon(node);
            }
          }
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }
});

window.addEventListener('scroll', handler);
window.addEventListener('resize', handler);
