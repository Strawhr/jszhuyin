'use strict';

module('Float32Encoder');

test('isSupported', function() {
  ok(Float32Encoder.isSupported, 'Passed!');
});

test('encodeArrayBuffer()', function() {
  var buf1 = (new Float32Array([3.1415927410125732])).buffer;
  deepEqual(
    Float32Encoder.encodeArrayBuffer(3.1415927410125732), buf1, 'Passed!');
  var buf2 = (new Float32Array([-3.1415927410125732])).buffer;
  deepEqual(
    arrayBufferToString(Float32Encoder.encodeArrayBuffer(-3.1415927410125732)),
    arrayBufferToString(buf2), 'Passed!');
});

test('decodeArrayBuffer()', function() {
  var buf1 = (new Float32Array([3.1415927410125732])).buffer;
  equal(Float32Encoder.decodeArrayBuffer(buf1), 3.1415927410125732, 'Passed!');
  var buf2 = (new Float32Array([-3.1415927410125732])).buffer;
  equal(Float32Encoder.decodeArrayBuffer(buf2), -3.1415927410125732, 'Passed!');
});

module('JSZhuyinDataPack');

test('construct with packed array buffer.', function() {
  var buf =
    new Uint16Array([0x0fdb, 0xc049 /* (new Float32Array([-3.1415927410125732])) */,
                     0x42 /* B */,
                     0x53f0, 0x5317, 0x53f0, 0x0, 0x53f0, 0x7063, /* 台北台NUL台灣 */
                     0x0 /* pad */])
    .buffer;
  var data = new JSZhuyinDataPack(buf);
  deepEqual(
    arrayBufferToString(data.packed), arrayBufferToString(buf), 'Passed!');
  equal(data.byteOffset, 0, 'Passed!');
  equal(data.length, 10, 'Passed!');
});

test('construct with packed array buffer (byteOffset !== 0).', function() {
  var buf =
    new Uint16Array([0x9999, 0x9999, 0x9999, 0x9999,
                     0x0fdb, 0xc049 /* (new Float32Array([-3.1415927410125732])) */,
                     0x42 /* B */,
                     0x53f0, 0x5317, 0x53f0, 0x0, 0x53f0, 0x7063, /* 台北台NUL台灣 */
                     0x0,
                     0x9999, 0x9999, 0x9999, 0x9999 /* pad */])
    .buffer;
  var data = new JSZhuyinDataPack(buf, 8, 10);
  deepEqual(
    arrayBufferToString(data.packed), arrayBufferToString(buf), 'Passed!');
  equal(data.byteOffset, 8, 'Passed!');
  equal(data.length, 10, 'Passed!');
});

test('construct with structured data.', function() {
  var data = new JSZhuyinDataPack([
    { str: '台北', score: 3.1415927410125732 },
    { str: '台' },
    { str: '台灣' }
  ]);

  deepEqual(data.unpacked, [
    { str: '台北', score: 3.1415927410125732 },
    { str: '台' },
    { str: '台灣' }
  ], 'Passed!');
});

test('unpack()', function() {
  var buf =
    new Uint16Array([0x0fdb, 0xc049 /* (new Float32Array([-3.1415927410125732])) */,
                     0x42 /* B */,
                     0x53f0, 0x5317, 0x53f0, 0x0, 0x53f0, 0x7063, /* 台北台NUL台灣 */
                     0x0 /* pad */])
      .buffer;

  var data = new JSZhuyinDataPack(buf);
  data.unpack();

  deepEqual(data.unpacked, [
    { str: '台北', score: -3.1415927410125732 },
    { str: '台' },
    { str: '台灣' }
  ], 'Passed!');
});

test('unpack() (byteOffset !== 0)', function() {
  var buf =
    new Uint16Array([0x9999, 0x9999, 0x9999, 0x9999,
                     0x0fdb, 0xc049 /* (new Float32Array([-3.1415927410125732])) */,
                     0x42 /* B */,
                     0x53f0, 0x5317, 0x53f0, 0x0, 0x53f0, 0x7063, /* 台北台NUL台灣 */
                     0x0,
                     0x9999, 0x9999, 0x9999, 0x9999 /* pad */])
      .buffer;

  var data = new JSZhuyinDataPack(buf, 8, 10);
  data.unpack();

  deepEqual(data.unpacked, [
    { str: '台北', score: -3.1415927410125732 },
    { str: '台' },
    { str: '台灣' }
  ], 'Passed!');
});

test('unpack() with symbols', function() {
  var buf =
    new Uint16Array([0x0fdb, 0xc049 /* (new Float32Array([-3.1415927410125732])) */,
                     0x62 /* b */,
                     0x53f0, 0x5317, 0xc2a, 0x233, 0x53f0, 0x0, 0xc2a, 0x0,
                     0x53f0, 0x7063, 0xc2a, 0x149,  /* 台北పȳ台NULపNUL台灣పŉ */
                     0x0 /* pad */]).buffer;
  var data = new JSZhuyinDataPack(buf);
  data.unpack();

  deepEqual(data.unpacked, [
    { str: '台北',
      symbols: 'పȳ',
      score: -3.1415927410125732 },
    { str: '台', symbols: 'ప' },
    { str: '台灣', symbols: 'పŉ' }
  ], 'Passed!');
});

test('pack()', function() {
  var buf =
    new Uint16Array([0x0fdb, 0xc049 /* (new Float32Array([-3.1415927410125732])) */,
                     0x42 /* B */,
                     0x53f0, 0x5317, 0x53f0, 0x0, 0x53f0, 0x7063, /* 台北台NUL台灣 */
                     0x0 /* pad */])
      .buffer;

  var data = new JSZhuyinDataPack([
    { str: '台北', score: -3.1415927410125732 },
    { str: '台' },
    { str: '台灣' }
  ]);
  data.pack();

  deepEqual(
    arrayBufferToString(data.packed), arrayBufferToString(buf), 'Passed!');
  equal(data.byteOffset, 0, 'Passed!');
  equal(data.length, 10, 'Passed!');
});

test('pack() with symbols', function() {
  var buf =
    new Uint16Array([0x0fdb, 0xc049 /* (new Float32Array([-3.1415927410125732])) */,
                     0x62 /* b */,
                     0x53f0, 0x5317, 0xc2a, 0x233, 0x53f0, 0x0, 0xc2a, 0x0,
                     0x53f0, 0x7063, 0xc2a, 0x149,  /* 台北పȳ台NULపNUL台灣పŉ */
                     0x0 /* pad */]).buffer;
  var data = new JSZhuyinDataPack([
    { str: '台北',
      symbols: 'పȳ',
      score: -3.1415927410125732 },
    { str: '台', symbols: 'ప' },
    { str: '台灣', symbols: 'పŉ' }
  ]);
  data.pack();

  deepEqual(
    arrayBufferToString(data.packed), arrayBufferToString(buf), 'Passed!');
});


test('getResults()', function() {
  var buf =
    new Uint16Array([0x0fdb, 0xc049 /* (new Float32Array([-3.1415927410125732])) */,
                     0x42 /* B */,
                     0x53f0, 0x5317, 0x53f0, 0x0, 0x53f0, 0x7063, /* 台北台NUL台灣 */
                     0x0 /* pad */])
      .buffer;
  var data = new JSZhuyinDataPack(buf);
  deepEqual(data.getResults(), [
    { str: '台北', score: -3.1415927410125732 },
    { str: '台' },
    { str: '台灣' }
  ], 'Passed!');
});

test('getPacked()', function() {
  var buf =
    new Uint16Array([0x0fdb, 0xc049 /* (new Float32Array([-3.1415927410125732])) */,
                     0x42 /* B */,
                     0x53f0, 0x5317, 0x53f0, 0x0, 0x53f0, 0x7063, /* 台北台NUL台灣 */
                     0x0 /* pad */])
      .buffer;
  var data = new JSZhuyinDataPack([
    { str: '台北', score: -3.1415927410125732 },
    { str: '台' },
    { str: '台灣' }
  ]);
  deepEqual(data.getPacked(), buf, 'Passed!');
});

test('getFirstResult()', function() {
  var buf =
    new Uint16Array([0x0fdb, 0xc049 /* (new Float32Array([-3.1415927410125732])) */,
                     0x42 /* B */,
                     0x53f0, 0x5317, 0x53f0, 0x0, 0x53f0, 0x7063, /* 台北台NUL台灣 */
                     0x0 /* pad */])
      .buffer;
  var data = new JSZhuyinDataPack(buf);
  deepEqual(data.getFirstResult(),
    { str: '台北', score: -3.1415927410125732 },
    'Passed!');
});

test('getFirstResult() with symbols', function() {
  var buf =
    new Uint16Array([0x0fdb, 0xc049 /* (new Float32Array([-3.1415927410125732])) */,
                     0x62 /* b */,
                     0x53f0, 0x5317, 0xc2a, 0x233, 0x53f0, 0x0, 0xc2a, 0x0,
                     0x53f0, 0x7063, 0xc2a, 0x149,  /* 台北పȳ台NULపNUL台灣పŉ */
                     0x0 /* pad */]).buffer;
  var data = new JSZhuyinDataPack(buf);
  deepEqual(data.getFirstResult(),
    { str: '台北',
      symbols: 'పȳ',
      score: -3.1415927410125732 },
    'Passed!');
});

test('getFirstResultScore()', function() {
  var buf =
    new Uint16Array([0x0fdb, 0xc049 /* (new Float32Array([-3.1415927410125732])) */,
                     0x42 /* B */,
                     0x53f0, 0x5317, 0x53f0, 0x0, 0x53f0, 0x7063, /* 台北台NUL台灣 */
                     0x0 /* pad */])
      .buffer;
  var data = new JSZhuyinDataPack(buf);
  equal(data.getFirstResultScore(),
    -3.1415927410125732, 'Passed!');
});
