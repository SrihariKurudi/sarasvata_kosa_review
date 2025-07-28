/** Shrinks header once the page is scrolled a bit */
export function adjustNavbar() {
  document.querySelector('header')
          .classList.toggle('compact', window.scrollY > 50);
}
