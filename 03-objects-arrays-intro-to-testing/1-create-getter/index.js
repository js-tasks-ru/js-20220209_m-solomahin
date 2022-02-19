/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {

  const pathMas = path.split('.');
  return function (obj) {
    let value = obj;
    pathMas.forEach(item => {
      value && (value = new Map(Object.entries(value)).get(item));
    });
    return value;

  };
}

