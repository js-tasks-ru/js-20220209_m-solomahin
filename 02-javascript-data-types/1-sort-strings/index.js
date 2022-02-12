/* sortStrings - sorts array of string by two criteria "asc" or "desc"
* @param {string[]} arr - the array of strings
* @param {string} [param="asc"] param - the sorting type "asc" or "desc"
* @returns {string[]}
*/
export function sortStrings(arr, param = 'asc') {
  let result = [...arr].sort((a, b) =>
    a.localeCompare(b, 'ru-en-u-kf-upper'));
  return param === "asc" ? result : result.reverse();
}







