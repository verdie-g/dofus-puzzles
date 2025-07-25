export function arrayShuffle<T>(array: T[]) {
  let currentIndex = array.length;

  while (currentIndex > 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    const tmp = array[currentIndex]!;
    array[currentIndex] = array[randomIndex]!;
    array[randomIndex] = tmp;
  }
}