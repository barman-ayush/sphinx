import React, { useState, useEffect } from "react";
import "./RSAVisualizer.css";
import { encrypt, decrypt } from "../utils/rsa.js";

function RSAVisualizer() {
	const [step, setStep] = useState(0);
	const [p, setP] = useState(null);
	const [q, setQ] = useState(null);
	const [message, setMessage] = useState("");
	const [rsaDetails, setRsaDetails] = useState(null);
	const [currentInput, setCurrentInput] = useState("");

	// Step-by-step RSA process
	const steps = [
		{
			title: "Prime Number Selection",
			description: "Enter the first prime number (p)",
			component: () => (
				<div className="input-step">
					<input
						type="number"
						value={currentInput}
						onChange={(e) => setCurrentInput(e.target.value)}
						placeholder="Enter first prime number (p)"
					/>
				</div>
			),
			validate: () => {
				const num = parseInt(currentInput);
				return isPrime(num) && num > 1;
			},
			onNext: () => {
				setP(parseInt(currentInput));
				setCurrentInput("");
			},
		},
		{
			title: "Second Prime Number",
			description: "Enter the second prime number (q)",
			component: () => (
				<div className="input-step">
					<input
						type="number"
						value={currentInput}
						onChange={(e) => setCurrentInput(e.target.value)}
						placeholder="Enter second prime number (q)"
					/>
				</div>
			),
			validate: () => {
				const num = parseInt(currentInput);
				return isPrime(num) && num > 1 && num !== p;
			},
			onNext: () => {
				setQ(parseInt(currentInput));
				setCurrentInput("");
			},
		},
		{
			title: "Calculate Modulus (n)",
			description: "Calculating n = p * q",
			component: () => (
				<div className="calculation-step">
					<p>
						n = {p} * {q} = {p * q}
					</p>
				</div>
			),
			validate: () => true,
			onNext: () => {
				// No additional action needed
			},
		},
		{
			title: "Calculate Euler's Totient (φ)",
			description: "Calculating φ = (p-1) * (q-1)",
			component: () => (
				<div className="calculation-step">
					<p>
						φ = ({p}-1) * ({q}-1) = {(p - 1) * (q - 1)}
					</p>
				</div>
			),
			validate: () => true,
			onNext: () => {
				// No additional action needed
			},
		},
		{
			title: "Select Public Key (e)",
			description: "Choose a coprime to φ",
			component: () => (
				<div className="input-step">
					<input
						type="number"
						value={currentInput}
						onChange={(e) => setCurrentInput(e.target.value)}
						placeholder="Enter public key (e)"
					/>
				</div>
			),
			validate: () => {
				const e = parseInt(currentInput);
				const phi = (p - 1) * (q - 1);
				return e > 1 && e < phi && gcd(e, phi) === 1;
			},
			onNext: () => {
				// Store e and calculate d
				const phi = (p - 1) * (q - 1);
				const e = parseInt(currentInput);
				const d = modInverse(e, phi);

				setRsaDetails({
					p,
					q,
					n: p * q,
					phi: (p - 1) * (q - 1),
					e,
					d,
				});

				setCurrentInput("");
			},
		},
		{
			title: "Enter Message",
			description: "Type the message to encrypt",
			component: () => (
				<div className="input-step">
					<input
						type="text"
						value={currentInput}
						onChange={(e) => setCurrentInput(e.target.value)}
						placeholder="Enter message to encrypt"
					/>
				</div>
			),
			validate: () => currentInput.trim().length > 0,
			onNext: () => {
				setMessage(currentInput);
				setCurrentInput("");
			},
		},
		{
			title: "Encryption",
			description: "Encrypting the message",
			component: () => {
				const encryptedHex = encrypt(
					{ e: rsaDetails.e, n: rsaDetails.n },
					message
				);
				return (
					<div className="encryption-step">
						<p>Original Message: {message}</p>
						<p>Encrypted Message (Hex): {encryptedHex}</p>
					</div>
				);
			},
			validate: () => true,
			onNext: () => {
				// No additional action needed
			},
		},
		{
			title: "Decryption",
			description: "Decrypting the message",
			component: () => {
				const encryptedHex = encrypt(
					{ e: rsaDetails.e, n: rsaDetails.n },
					message
				);
				const decryptedMessage = decrypt(
					{
						d: rsaDetails.d,
						n: rsaDetails.n,
					},
					encryptedHex
				);
				return (
					<div className="decryption-step">
						<p>Encrypted Message (Hex): {encryptedHex}</p>
						<p>Decrypted Message: {decryptedMessage}</p>
					</div>
				);
			},
			validate: () => true,
			onNext: () => {
				// Final step
			},
		},
	];

	// Utility Functions
	const isPrime = (num) => {
		if (num < 2) return false;
		for (let i = 2; i <= Math.sqrt(num); i++) {
			if (num % i === 0) return false;
		}
		return true;
	};

	const gcd = (a, b) => {
		while (b !== 0) {
			[a, b] = [b, a % b];
		}
		return a;
	};

	const modInverse = (e, phi) => {
		let d = 1;
		while ((d * e) % phi !== 1) {
			d++;
		}
		return d;
	};

	const handleNext = () => {
		const currentStepObj = steps[step];

		// Validate current step
		if (currentStepObj.validate()) {
			// Perform any next step actions
			currentStepObj.onNext();

			// Move to next step
			setStep(step + 1);
		} else {
			alert("Invalid input. Please check and try again.");
		}
	};

	// Handle Previous Step
	const handlePrevious = () => {
		if (step > 0) {
			setStep(step - 1);
		}
	};

	return (
		<div className="rsa-visualizer">
			<link
				href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
				rel="stylesheet"
			></link>
			<h1 className="text-white">RSA Encryption Step-by-Step</h1>

			<div className="current-step">
				<h2 className="text-white">{steps[step].title}</h2>
				<p className="text-white">{steps[step].description}</p>

				{steps[step].component()}
			</div>

			<div className="step-navigation">
				{step > 0 && <button onClick={handlePrevious}>Previous Step</button>}
				{step < steps.length - 1 && (
					<button onClick={handleNext}>Next Step</button>
				)}
			</div>
		</div>
	);
}

export default RSAVisualizer;
