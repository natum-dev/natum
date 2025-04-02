export const shuffle = <T>(arr: ArrayLike<T>) => {
  const newArr = Array.from<T>(arr);
  let tempIdx, tempValue;

  for (let i = newArr.length - 1; i >= 0; i--) {
    // pick random index that's not shuffled yet
    tempIdx = Math.floor(Math.random() * (i + 1));

    // swap
    tempValue = newArr[tempIdx];
    newArr[tempIdx] = newArr[i];
    newArr[i] = tempValue;
  }

  return newArr;
};
