module.exports = function init () {
	const seedrandom = require('./seedrandom');


	let SyncRandomBytes;
	let seed;

	let prng = seedrandom(seed);
	let early = false;

	if (!seed && SyncRandomBytes) {
		early = true;
		SyncRandomBytes.randomBytes()
			.then(seed => {
				early = false;
				prng = seedrandom(seed);
			})
			.catch(err => {
				early = false;
				console.log(`WARNING: can not collect seed data: ${err.message}`);
			});
	}

	function randomFillUint32 (input) {
		const len = input.length;
		if (len > 16384) { // 65536 by 4
			throw new Error('QuotaExceeded');
		}
		for (let i = len - 1; i >= 0; i--) {
			input[i] = prng.int32();
		}
		return input;
	}

	function randomFillInt32 (input) {
		const len = input.length;
		if (len > 16384) { // 65536 by 4
			throw new Error('QuotaExceeded');
		}
		for (let i = len - 1; i >= 0; i--) {
			input[i] = prng.int32() - 0x80000000;
		}
		return input;
	}

	function randomFillUint8 (input) {
		if (input.length > 65536) {
			throw new Error('QuotaExceeded');
		}
		const count = (input.length * 0.25 + 1) | 0;
		for (let i = count - 1, n = 0; i >= 0; i--) {
			const value = prng.int32();
			input[n++] = value & 0xff;
			input[n++] = (value >> 8) & 0xff;
			input[n++] = (value >> 16) & 0xff;
			input[n++] = (value >> 24) & 0xff;
		}
		return input;
	}

	function randomFillInt8 (input) {
		if (input.length > 65536) {
			throw new Error('QuotaExceeded');
		}
		const count = (input.length * 0.25 + 1) | 0;
		for (let i = count - 1, n = 0; i >= 0; i--) {
			const value = prng.int32();
			input[n++] = (value & 0xff) - 0x80;
			input[n++] = ((value >> 8) & 0xff) - 0x80;
			input[n++] = ((value >> 16) & 0xff) - 0x80;
			input[n++] = ((value >> 24) & 0xff) - 0x80;
		}
		return input;
	}

	function randomFillUint16 (input) {
		if (input.length > 32767) {
			throw new Error('QuotaExceeded');
		}
		const count = (input.length * 0.5 + 1) | 0;
		for (let i = count - 1, n = 0; i >= 0; i--) {
			const value = prng.int32();
			input[n++] = value & 0xffff;
			input[n++] = (value >> 16) & 0xffff;
		}
		return input;
	}

	function randomFillInt16 (input) {
		if (input.length > 32767) {
			throw new Error('QuotaExceeded');
		}
		const count = (input.length * 0.5 + 1) | 0;
		for (let i = count - 1, n = 0; i >= 0; i--) {
			const value = prng.int32();
			input[n++] = (value & 0xffff) - 0x8000;
			input[n++] = ((value >> 16) & 0xffff) - 0x8000;
		}
		return input;
	}

	return function getSeedRandomValues (input) {
		if (early) {
			early = false;
			console.log('WARNING: random data is requested before the seed is done');
		}
		if (input === null || input === undefined) {
			throw new Error('invalid type');
		}
		if (input instanceof Uint8Array) {
			return randomFillUint8(input);
		}
		if (input instanceof Uint32Array) {
			return randomFillUint32(input);
		}
		if (input instanceof Uint16Array) {
			return randomFillUint16(input);
		}
		if (input instanceof Int32Array) {
			return randomFillInt32(input);
		}
		if (input instanceof Int16Array) {
			return randomFillInt16(input);
		}
		if (input instanceof Int8Array) {
			return randomFillInt8(input);
		}
		if (input instanceof Uint8ClampedArray) {
			return randomFillUint8(input);
		}
		throw new Error('invalid type');
	};
};
