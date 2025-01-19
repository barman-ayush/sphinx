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
const RSAVizMap = () => {
	const canvasRef = useRef(null);
	const [visualizationType, setVisualizationType] = useState("linear");
	const [params, setParams] = useState({
		p: 7,
		q: 11,
		e: 17,
		messageStart: 0,
		messageEnd: 20,
	});

	const [calculator, setCalculator] = useState(
		() => new RSACalculator(params.p, params.q, params.e)
	);
	const [currentStep, setCurrentStep] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [speed, setSpeed] = useState(50);
	const [connections, setConnections] = useState([]);
	const generateConnections = useCallback(() => {
		const newConnections = [];
		const numPoints = params.messageEnd - params.messageStart + 1;

		for (let i = params.messageStart; i <= params.messageEnd; i++) {
			const encrypted = calculator.encrypt(i);
			newConnections.push({
				plaintext: i,
				ciphertext: encrypted,
				isSelfMapping: i === encrypted,
			});
		}

		setConnections(newConnections);
	}, [calculator, params.messageEnd, params.messageStart]);

	const drawLinear = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const spacing =
			canvas.width / (params.messageEnd - params.messageStart + 2);
		const topY = 80;
		const bottomY = canvas.height - 80;

		// Draw grid lines
		ctx.strokeStyle = "#f0f0f0";
		ctx.lineWidth = 1;
		for (let i = params.messageStart; i <= params.messageEnd; i++) {
			const x = spacing * (i - params.messageStart + 1);
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, canvas.height);
			ctx.stroke();
		}

		// Draw points and numbers
		for (let i = params.messageStart; i <= params.messageEnd; i++) {
			const x = spacing * (i - params.messageStart + 1);

			// Draw points
			ctx.fillStyle = "red";
			ctx.beginPath();
			ctx.arc(x, topY, 4, 0, Math.PI * 2);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(x, bottomY, 4, 0, Math.PI * 2);
			ctx.fill();

			// Draw labels
			ctx.fillStyle = "black";
			ctx.font = "14px Arial";
			ctx.textAlign = "center";
			ctx.fillText(i.toString(), x, topY - 15);
			ctx.fillText(i.toString(), x, bottomY + 20);
		}

		// Draw connections
		connections.slice(0, currentStep).forEach((conn) => {
			const startX = spacing * (conn.plaintext - params.messageStart + 1);
			const endX = spacing * (conn.ciphertext - params.messageStart + 1);

			ctx.strokeStyle = conn.isSelfMapping ? "red" : "green";
			ctx.lineWidth = conn.isSelfMapping ? 2 : 1;

			ctx.beginPath();
			ctx.moveTo(startX, topY);
			ctx.lineTo(endX, bottomY);
			ctx.stroke();
		});
	}, [connections, currentStep, params]);

	const drawElliptical = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const centerX = canvas.width / 2;
		const centerY = canvas.height / 2;
		const radius = Math.min(canvas.width, canvas.height) * 0.4;
		const numPoints = params.messageEnd - params.messageStart + 1;

		// Draw circle guide
		ctx.strokeStyle = "#f0f0f0";
		ctx.beginPath();
		ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
		ctx.stroke();

		// Draw points and numbers
		for (let i = 0; i < numPoints; i++) {
			const angle = (i * 2 * Math.PI) / numPoints;
			const x = centerX + radius * Math.cos(angle);
			const y = centerY + radius * Math.sin(angle);

			ctx.fillStyle = "red";
			ctx.beginPath();
			ctx.arc(x, y, 4, 0, Math.PI * 2);
			ctx.fill();

			ctx.fillStyle = "black";
			ctx.font = "14px Arial";
			ctx.textAlign = "center";
			ctx.fillText(
				(i + params.messageStart).toString(),
				x + 15 * Math.cos(angle),
				y + 15 * Math.sin(angle)
			);
		}

		// Draw connections
		connections.slice(0, currentStep).forEach((conn) => {
			const startAngle =
				((conn.plaintext - params.messageStart) * 2 * Math.PI) / numPoints;
			const endAngle =
				((conn.ciphertext - params.messageStart) * 2 * Math.PI) / numPoints;

			const startX = centerX + radius * Math.cos(startAngle);
			const startY = centerY + radius * Math.sin(startAngle);
			const endX = centerX + radius * Math.cos(endAngle);
			const endY = centerY + radius * Math.sin(endAngle);

			ctx.strokeStyle = conn.isSelfMapping ? "red" : "green";
			ctx.lineWidth = conn.isSelfMapping ? 2 : 1;

			ctx.beginPath();
			ctx.moveTo(startX, startY);
			ctx.lineTo(endX, endY);
			ctx.stroke();
		});
	}, [connections, currentStep, params]);
	useEffect(() => {
		if (canvasRef.current) {
			canvasRef.current.width = 1200;
			canvasRef.current.height = 600;
			generateConnections();
		}
	}, [generateConnections]);

	useEffect(() => {
		if (visualizationType === "linear") {
			drawLinear();
		} else {
			drawElliptical();
		}
	}, [drawLinear, drawElliptical, visualizationType]);

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
	return (
		<div className="flex flex-col gap-5 p-5 bg-white rounded-lg shadow-sm">
			<div className="flex gap-4 items-center">
				<button
					onClick={() =>
						setVisualizationType((v) =>
							v === "linear" ? "elliptical" : "linear"
						)
					}
					className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
				>
					View: {visualizationType === "linear" ? "Linear" : "Elliptical"}
				</button>
				<div className="text-sm text-gray-600">
					{currentStep} / {connections.length} steps
				</div>
			</div>

			<div className="flex gap-5">
				<div className="flex-grow">
					<canvas
						ref={canvasRef}
						className="border border-gray-200 rounded-md bg-white w-full"
					/>

					{/* Controls */}
					<div className="flex items-center gap-4 mt-4 p-3 bg-gray-50 rounded-md">
						<button
							onClick={() => setIsPlaying(!isPlaying)}
							className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
						>
							{isPlaying ? "Pause" : "Play"}
						</button>

						<div className="flex items-center gap-2">
							<span className="text-sm text-gray-600">Speed:</span>
							<input
								type="range"
								min="1"
								max="100"
								value={speed}
								onChange={(e) => setSpeed(parseInt(e.target.value))}
								className="w-32"
							/>
						</div>

						<button
							onClick={() =>
								setCurrentStep((prev) => Math.min(prev + 1, connections.length))
							}
							className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
						>
							Next
						</button>

						<button
							onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
							className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
						>
							Previous
						</button>

						<button
							onClick={() => setCurrentStep(0)}
							className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
						>
							Reset
						</button>
					</div>

					{/* Encryption Results */}
					<div className="mt-5 p-4 bg-white border border-gray-200 rounded-md h-72 overflow-y-auto">
						<div className="grid grid-cols-2 gap-4">
							{connections.map((conn, idx) => (
								<div
									key={idx}
									className={`p-2 rounded ${
										idx < currentStep ? "bg-green-50" : "bg-gray-50"
									}`}
								>
									{conn.plaintext} → {conn.ciphertext}
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Parameters Panel */}
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
									setParams((prev) => ({
										...prev,
										p: parseInt(e.target.value),
									}))
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
									setParams((prev) => ({
										...prev,
										q: parseInt(e.target.value),
									}))
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
									setParams((prev) => ({
										...prev,
										e: parseInt(e.target.value),
									}))
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
									className="w-24 px-3 py-2 border border-gray-300 rounded-md"
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
									className="w-24 px-3 py-2 border border-gray-300 rounded-md"
								/>
							</div>
						</div>

						<button
							onClick={() => {
								setCalculator(new RSACalculator(params.p, params.q, params.e));
								setCurrentStep(0);
								generateConnections();
							}}
							className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
						>
							Update Parameters
						</button>

						{/* RSA Info */}
						<div className="mt-4 p-3 bg-white border border-gray-200 rounded-md">
							<p className="text-sm">n = {calculator.n}</p>
							<p className="text-sm">φ(n) = {calculator.phi}</p>
							<p className="text-sm">d = {calculator.d}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
export default RSAVizMap;
