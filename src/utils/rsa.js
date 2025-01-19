function gcd(a, b) {
	while (b !== 0) {
		[a, b] = [b, a % b];
	}
	return a;
}
function multiplicativeInverse(e, phi) {
	let [x0, x1, y0, y1] = [0, 1, 1, 0];
	let originalPhi = phi;
	while (e !== 0) {
		let q = Math.floor(phi / e);
		[phi, e] = [e, phi % e];
		[x0, x1] = [x1 - q * x0, x0];
		[y0, y1] = [y1 - q * y0, y0];
	}
	if (phi !== 1) return null;
	return y1 < 0 ? y1 + originalPhi : y1;
}
export function isPrime(num) {
	if (num < 2) return false;
	for (let i = 2; i <= Math.sqrt(num); i++) {
		if (num % i === 0) return false;
	}
	return true;
}
export function generateKeypair(p, q) {
	console.log(`P: ${p} | Q: ${q}`);
	if (!isPrime(p) || !isPrime(q)) {
		throw new Error("Both numbers must be prime.");
	} else if (p === q) {
		throw new Error("p and q cannot be the same");
	}
	const n = p * q;
	const phi = (p - 1) * (q - 1);
	let e = Math.floor(Math.random() * (phi - 1)) + 1;
	while (gcd(e, phi) !== 1) {
		e = Math.floor(Math.random() * (phi - 1)) + 1;
	}
	const d = multiplicativeInverse(e, phi);
	if (d === null) {
		throw new Error("Failed to find multiplicative inverse.");
	}
	return { publicKey: { e, n }, privateKey: { d, n } };
}
export function encrypt(publicKey, plaintext) {
	const { e, n } = publicKey;
	const cipher = Array.from(plaintext).map((char) => {
		const encryptedChar = BigInt(char.charCodeAt(0)) ** BigInt(e) % BigInt(n);
		return encryptedChar.toString(16).padStart(4, "0");
	});
	return cipher.join("");
}
export function decrypt(privateKey, ciphertext) {
	const { d, n } = privateKey;
	const chars = ciphertext.match(/.{1,4}/g) || [];
	const plain = chars.map((hex) => {
		const encryptedChar = BigInt(parseInt(hex, 16));
		const decryptedChar = encryptedChar ** BigInt(d) % BigInt(n);
		return String.fromCharCode(Number(decryptedChar));
	});
	return plain.join("");
}
// Example usageconst p = 61; // Example prime numberconst q = 53; // Example prime number
// const { publicKey, privateKey } = generateKeypair(p, q);
// const message = "HELLO329644368345985341";
// const encrypted = encrypt(publicKey, message);
// console.log("Encrypted message (hex):", encrypted);
// const decrypted = decrypt(privateKey, encrypted);
// console.log("Decrypted message:", decrypted);
