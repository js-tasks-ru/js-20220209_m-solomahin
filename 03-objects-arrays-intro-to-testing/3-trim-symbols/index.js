/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size = string.length) {

  let dem = string.split("");

  let i = 0;
  while (i < dem.length) {
    if (dem[i] === dem[+i + 1]) {
      dem.splice(+i + 1, 1);
      i--;
    }
    i++;
  }

  let trimString = "";
  let startIndex = 0;
  for (const i of dem) {
    let counter = 0;
    let idx = string.indexOf(i, startIndex);
    while (idx !== -1 && counter++ < size) {
      trimString += i;
      idx = string[idx + 1] === i ? idx + 1 : -1;
      startIndex++;
    }
  }

  return trimString;
}
