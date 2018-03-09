function storageSpace(storage) {
  const blockCache = {};
  function buildBlock(bytes) {
    if (blockCache.bytes !== bytes) {
      blockCache.bytes = bytes;
      blockCache.string = Array(bytes + 1).join('-');
    }

    return blockCache.string;
  }

  function attemptAdd(size) {
    const block = buildBlock(size);
    const key = BASE_KEY + maxKeyIndex.toString();

    try {
      storage.setItem(key, block);
    } catch (e) {
      return false;
    }

    maxKeyIndex++;
    return true;
  }

  function cleanup() {
    for (let i = 0; i < maxKeyIndex; i++) {
      storage.removeItem(BASE_KEY + i.toString());
    }
  }

  function nextSize(prev, lowerBound, upperBound) {
    if (Number.isFinite(upperBound)) {
      return Math.floor((lowerBound + upperBound) / 2);
    } else {
      return prev * 2;
    }
  }

  // Does the key size count towards the cap? If not, can we use keys to get more storage?
  const BASE_KEY = '__storage_size_test__';
  let maxKeyIndex = 0;
  let i = 0;
  let total = 0;
  let blockSize = 1 * 2 ** 20; // 1MB
  let fit;

  do {
    fit = attemptAdd(blockSize);

    if (fit) {
      total += blockSize;
    } else {
      blockSize /= 2;
    }
  } while (fit || blockSize > 1);

  if (total) cleanup();

  return total;
}

console.time('size');
var result = storageSpace(localStorage);
console.timeEnd('size');
console.log(result);
