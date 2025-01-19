import React, { useEffect, useRef, useState, useCallback } from "react";

class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

class RSACalculator {
	constructor(p, q, e) {
		this.p = p;
		this.q = q;
		this.e = e;
		this.n = p * q;
		this.phi = (p - 1) * (q - 1);
		this.d = this.calculateD();
	}

	calculateD() {
		return this.modInverse(this.e, this.phi);
	}

	modInverse(a, m) {
		let [old_r, r] = [a, m];
		let [old_s, s] = [1, 0];
		let [old_t, t] = [0, 1];

		while (r !== 0) {
			const quotient = Math.floor(old_r / r);
			[old_r, r] = [r, old_r - quotient * r];
			[old_s, s] = [s, old_s - quotient * s];
			[old_t, t] = [t, old_t - quotient * t];
		}

		return old_s < 0 ? old_s + m : old_s;
	}

	encrypt(message) {
		return this.modPow(message, this.e, this.n);
	}

	decrypt(ciphertext) {
		return this.modPow(ciphertext, this.d, this.n);
	}

	modPow(base, exponent, modulus) {
		if (modulus === 1) return 0;
		let result = 1;
		base = base % modulus;
		while (exponent > 0) {
			if (exponent % 2 === 1) {
				result = (result * base) % modulus;
			}
			base = (base * base) % modulus;
			exponent = Math.floor(exponent / 2);
		}
		return result;
	}
}

const RSAVisualization = () => {
	const canvasRef = useRef(null);
	const [params, setParams] = useState({
		p: 7,
		q: 11,
		e: 17,
		messageStart: 0,
		messageEnd: 100,
	});

	const [calculator, setCalculator] = useState(
		() => new RSACalculator(params.p, params.q, params.e)
	);
	const [currentStep, setCurrentStep] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [speed, setSpeed] = useState(50);
	const [fixPoints, setFixPoints] = useState([]);
	const [connections, setConnections] = useState([]);

	const findEncryptedIndex = useCallback((encrypted, points) => {
		const idx = points.findIndex(
			(fp) => fp.type === "ciphertext" && fp.value === encrypted
		);
		return Math.floor(idx / 2);
	}, []);

	const generateConnections = useCallback(
		(points) => {
			const newConnections = [];
			const numPoints = params.messageEnd - params.messageStart + 1;

			for (let i = 0; i < numPoints; i++) {
				const plaintext = params.messageStart + i;
				const encrypted = calculator.encrypt(plaintext);

				const startIdx = i;
				const endIdx = findEncryptedIndex(encrypted, points);

				if (endIdx !== -1) {
					newConnections.push({
						startIdx: startIdx,
						endIdx: endIdx,
						plaintext: plaintext,
						ciphertext: encrypted,
						isSelfMapping: plaintext === encrypted,
					});
				}
			}

			newConnections.sort((a, b) => (a.isSelfMapping ? 1 : -1));
			setConnections(newConnections);
		},
		[calculator, params.messageEnd, params.messageStart, findEncryptedIndex]
	);

	const initialize = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const spacing =
			canvas.width / (params.messageEnd - params.messageStart + 2);
		const topY = 80;
		const bottomY = canvas.height - 80;

		const newFixPoints = [];

		for (let i = params.messageStart; i <= params.messageEnd; i++) {
			const x = spacing * (i - params.messageStart + 1);
			newFixPoints.push({
				point: new Point(x, topY),
				value: i,
				type: "plaintext",
			});
			const encrypted = calculator.encrypt(i);
			newFixPoints.push({
				point: new Point(x, bottomY),
				value: encrypted,
				type: "ciphertext",
			});
		}

		setFixPoints(newFixPoints);
		generateConnections(newFixPoints);
	}, [params.messageEnd, params.messageStart, calculator, generateConnections]);

	const draw = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Draw grid lines
		ctx.strokeStyle = "#f0f0f0";
		ctx.lineWidth = 1;
		fixPoints.forEach(({ point }) => {
			ctx.beginPath();
			ctx.moveTo(point.x, 0);
			ctx.lineTo(point.x, canvas.height);
			ctx.stroke();
		});

		// Draw connections
		connections.slice(0, currentStep).forEach((conn) => {
			const start = fixPoints[conn.startIdx].point;
			const end = fixPoints[conn.endIdx * 2 + 1].point;

			ctx.strokeStyle = conn.isSelfMapping ? "red" : "green";
			ctx.lineWidth = conn.isSelfMapping ? 2 : 1;

			ctx.beginPath();
			ctx.moveTo(start.x, start.y);
			ctx.lineTo(end.x, end.y);
			ctx.stroke();
		});

		// Draw points and numbers
		fixPoints.forEach(({ point, value, type }) => {
			ctx.strokeStyle = "red";
			ctx.fillStyle = "red";
			ctx.beginPath();
			ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();

			ctx.fillStyle = "black";
			ctx.font = "14px Arial";
			ctx.textAlign = "center";
			ctx.fillText(
				value.toString(),
				point.x,
				point.y + (type === "plaintext" ? -15 : 20)
			);
		});
	}, [connections, currentStep, fixPoints]);

	useEffect(() => {
		if (canvasRef.current) {
			canvasRef.current.width = 1200;
			canvasRef.current.height = 600;
			initialize();
		}
	}, [initialize]);

	useEffect(() => {
		draw();
	}, [draw]);

	useEffect(() => {
		let interval;
		if (isPlaying) {
			interval = setInterval(() => {
				setCurrentStep((prev) => {
					if (prev >= connections.length) {
						setIsPlaying(false);
						return prev;
					}
					return prev + 1;
				});
			}, 100 - speed);
		}
		return () => clearInterval(interval);
	}, [isPlaying, speed, connections.length]);

	const updateParameters = useCallback(() => {
		const newCalculator = new RSACalculator(params.p, params.q, params.e);
		setCalculator(newCalculator);
		setCurrentStep(0);
	}, [params]);

	return (
		<div className="flex gap-5 p-5 bg-white rounded-lg shadow-sm">
			<div className="flex-grow">
				<canvas
					ref={canvasRef}
					className="border border-gray-200 rounded-md bg-white w-full"
				/>
				<div className="flex items-center gap-4 mt-4 p-3 bg-gray-50 rounded-md">
					<button
						onClick={() => setIsPlaying(!isPlaying)}
						className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
					>
						{isPlaying ? "Pause" : "Continue"}
					</button>
					<input
						type="range"
						min="1"
						max="100"
						value={speed}
						onChange={(e) => setSpeed(parseInt(e.target.value))}
						className="w-40"
					/>
					<button
						onClick={() =>
							setCurrentStep((prev) => Math.min(prev + 1, connections.length))
						}
						className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
					>
						Next step
					</button>
					<button
						onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
						className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
					>
						Previous step
					</button>
					<button
						onClick={() => setCurrentStep(0)}
						className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
					>
						Reset
					</button>
				</div>
				<div className="mt-5 p-4 bg-white border border-gray-200 rounded-md h-72 overflow-y-auto font-mono text-sm">
					{Array.from(
						{ length: params.messageEnd - params.messageStart + 1 },
						(_, i) => {
							const value = params.messageStart + i;
							return (
								<div key={i}>
									{value}^{calculator.e} mod {calculator.n} ={" "}
									{calculator.encrypt(value)}
								</div>
							);
						}
					)}
				</div>
			</div>
			<div className="w-64 bg-gray-50 p-5 rounded-lg">
				<h3 className="text-lg font-semibold mb-4">RSA Parameters</h3>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							p (prime):
						</label>
						<input
							type="number"
							value={params.p}
							onChange={(e) =>
								setParams((prev) => ({ ...prev, p: parseInt(e.target.value) }))
							}
							className="w-24 px-3 py-2 border border-gray-300 rounded-md"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							q (prime):
						</label>
						<input
							type="number"
							value={params.q}
							onChange={(e) =>
								setParams((prev) => ({ ...prev, q: parseInt(e.target.value) }))
							}
							className="w-24 px-3 py-2 border border-gray-300 rounded-md"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							e (public exponent):
						</label>
						<input
							type="number"
							value={params.e}
							onChange={(e) =>
								setParams((prev) => ({ ...prev, e: parseInt(e.target.value) }))
							}
							className="w-24 px-3 py-2 border border-gray-300 rounded-md"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Message range:
						</label>
						<div className="flex gap-2">
							<input
								type="number"
								value={params.messageStart}
								onChange={(e) =>
									setParams((prev) => ({
										...prev,
										messageStart: parseInt(e.target.value),
									}))
								}
								className="w-20 px-3 py-2 border border-gray-300 rounded-md"
							/>
							<input
								type="number"
								value={params.messageEnd}
								onChange={(e) =>
									setParams((prev) => ({
										...prev,
										messageEnd: parseInt(e.target.value),
									}))
								}
								className="w-20 px-3 py-2 border border-gray-300 rounded-md"
							/>
						</div>
					</div>
					<button
						onClick={updateParameters}
						className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors mt-4"
					>
						Update Parameters
					</button>
					<div className="mt-5 p-4 bg-white border border-gray-200 rounded-md">
						<p>n = {calculator.n}</p>
						<p>φ(n) = {calculator.phi}</p>
						<p>d = {calculator.d}</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RSAVisualization;
