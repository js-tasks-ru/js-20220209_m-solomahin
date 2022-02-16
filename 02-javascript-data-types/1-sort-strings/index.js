/* sortStrings - sorts array of string by two criteria "asc" or "desc"
* @param {string[]} arr - the array of strings
* @param {string} [param="asc"] param - the sorting type "asc" or "desc"
* @returns {string[]}
*/
export function sortStrings(arr, param = 'asc') {
  const direction = {
    asc: 1,
    desc: -1
  };

  const dem = direction[param];

  return [...arr].sort((a, b) => dem * a.localeCompare(b, 'ru-en-u-kf-upper'));
}






