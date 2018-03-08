(function() {
  const INITIAL_BLOCK_SIZE = 2.5 * 2 ** 20; // 2.5 MB, half of most browsers' storage
  // Does the key size count towards the cap? If not, can we use keys to get more storage?
  const KEY = '__storage_size_test__';

  function buildBlock(bytes) {
      return Array(bytes + 1).join('-');
  }

  function attemptFill(storage, size) {
    const block = buildBlock(size);

    try {
      storage.setItem(KEY, block);
    } catch (e) {
      storage.removeItem(KEY);
      return false;
    }

    storage.removeItem(KEY);
    return true;
  }

  function nextSize(prev, lowerBound, upperBound) {
    if (Number.isFinite(upperBound)) {
      return Math.floor((lowerBound + upperBound) / 2);
    } else {
      return prev * 2;
    }
  }

  function findBounds(storage, accuracy) {
    let size = INITIAL_BLOCK_SIZE;
    let lowerBound = 0; // Inclusive
    let upperBound = Infinity; // Exclusive

    do {
      const fit = attemptFill(storage, size);
      // console.log(`[${lowerBound}, ${size}, ${upperBound})`, fit);

      if (fit) {
        lowerBound = size + 1;
      } else {
        upperBound = size;
      }

      size = nextSize(size, lowerBound, upperBound);
    } while (upperBound - lowerBound > accuracy);

    return { size, lowerBound, upperBound };
  }

  console.time('size');
  const result = findBounds(localStorage, 1);
  console.timeEnd('size');
  console.log(result);
})();
