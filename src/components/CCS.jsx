import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import "./CCS.css";

const CryptographicConfigSimulator = () => {
	const [algorithm, setAlgorithm] = useState("AES");
	const [keyLength, setKeyLength] = useState("");
	const [mode, setMode] = useState("");
	const [padding, setPadding] = useState("");
	const [authTagLength, setAuthTagLength] = useState("");
	const [vulnerabilityReport, setVulnerabilityReport] = useState("");

	function getRiskLevel(component) {
		if (
			Object.values(component).includes("1024") ||
			component === "ECB" ||
			component === "3DES"
		) {
			return "HIGH RISK";
		}
		if (Object.values(component).includes("2048") || component === "CBC") {
			return "MEDIUM RISK";
		}
		return "LOW RISK";
	}

	function getVulnerabilityList(algorithm, keyLength, mode, padding) {
		let vulns = [];
		switch (algorithm) {
			case "AES":
				if (keyLength < 256)
					vulns.push(
						"Potential future vulnerability to quantum computing attacks"
					);
				if (mode === "ECB")
					vulns.push("Vulnerable to pattern analysis and replay attacks");
				if (mode === "CBC")
					vulns.push(
						"Potential padding oracle attacks if improperly implemented"
					);
				break;
			case "RSA":
				if (keyLength < 2048) vulns.push("Vulnerable to factorization attacks");
				if (padding === "PKCS1v1.5")
					vulns.push("Vulnerable to Bleichenbacher's attack");
				break;
			case "3DES":
				vulns.push("Vulnerable to Sweet32 birthday attacks");
				vulns.push("Vulnerable to meet-in-the-middle attacks");
				break;
		}
		return vulns;
	}

	function getMitigationStrategies(algorithm, keyLength, mode, padding) {
		let strategies = [];
		switch (algorithm) {
			case "AES":
				if (keyLength < 256)
					strategies.push("Upgrade to AES-256 for future-proof security");
				if (mode === "ECB")
					strategies.push("Switch to GCM mode for authenticated encryption");
				break;
			case "RSA":
				if (keyLength < 2048)
					strategies.push("Increase key length to minimum 2048 bits");
				if (padding === "PKCS1v1.5")
					strategies.push("Migrate to OAEP-SHA256 padding");
				break;
			case "3DES":
				strategies.push("Migrate to AES-256-GCM");
				break;
		}
		return strategies;
	}

	function getImplementationGuidelines(algorithm) {
		return [
			"Use validated cryptographic libraries",
			"Implement proper key management procedures",
			"Regular security audits and updates",
			"Proper initialization vector handling",
			"Secure random number generation",
			"Regular key rotation schedule",
		];
	}

	function getIndustryStandards() {
		return [
			"NIST SP 800-57: Recommendation for Key Management",
			"FIPS 140-2/3: Security Requirements for Cryptographic Modules",
			"PCI DSS Requirements for Cryptographic Systems",
			"OWASP Cryptographic Storage Cheat Sheet Guidelines",
			"ISO/IEC 27001:2013 Information Security Controls",
		];
	}

	function getFutureConsiderations(algorithm) {
		return [
			"Post-quantum cryptography readiness",
			"Regular assessment of cryptographic agility",
			"Monitoring of new vulnerability disclosures",
			"Compliance with evolving regulatory requirements",
			"Performance optimization considerations",
		];
	}

	const configurations = {
		AES: {
			keyLengths: [128, 192, 256],
			modes: ["GCM", "CBC", "CTR", "ECB", "CFB", "OFB"],
			padding: ["PKCS7", "ISO10126", "No Padding"],
			authTagLengths: [128, 120, 112, 104, 96],
		},
		RSA: {
			keyLengths: [1024, 2048, 3072, 4096, 7680, 15360],
			padding: ["PKCS1v1.5", "OAEP-SHA1", "OAEP-SHA256", "PSS"],
		},
		ChaCha20: {
			keyLengths: [256],
			modes: ["Poly1305"],
			authTagLengths: [128],
		},
		"3DES": {
			keyLengths: [168],
			padding: ["PKCS7", "ISO10126", "No Padding"],
		},
	};

	const vulnerabilities = {
		AES: {
			keyLengths: {
				128: "Adequate for most current applications, but may not be future-proof against quantum computers.",
				192: "Strong security margin, recommended for long-term security.",
				256: "Maximum security level, quantum-resistant.",
			},
			modes: {
				ECB: "HIGH RISK: Vulnerable to pattern analysis and replay attacks. Does not provide semantic security.",
				CBC: "MEDIUM RISK: Vulnerable to padding oracle attacks if not implemented correctly. Requires IV.",
				CTR: "Secure when used with unique nonce. No padding required but counter management is critical.",
				GCM: "Recommended. Provides both confidentiality and authenticity.",
				CFB: "Requires careful IV handling. Vulnerable to bit-flipping attacks.",
				OFB: "Requires unique IV. Vulnerable to message stream modification.",
			},
			padding: {
				PKCS7:
					"Standard padding scheme. Vulnerable to padding oracle attacks if not implemented properly.",
				ISO10126:
					"Random padding bytes make oracle attacks harder, but still possible.",
				"No Padding":
					"Secure only with modes that don't require padding (CTR, GCM).",
			},
		},
		RSA: {
			keyLengths: {
				1024: "HIGH RISK: Considered broken. Not suitable for any current use.",
				2048: "MEDIUM RISK: Minimum acceptable for short-term security until 2030.",
				3072: "Recommended for medium-term security (beyond 2030).",
				4096: "Strong security margin, suitable for long-term security.",
				7680: "Very strong security, but with significant performance impact.",
				15360: "Maximum security level, significant performance overhead.",
			},
			padding: {
				"PKCS1v1.5":
					"HIGH RISK: Vulnerable to Bleichenbacher's attack. Not recommended for new applications.",
				"OAEP-SHA1":
					"MEDIUM RISK: SHA1 is cryptographically broken, but OAEP construct is sound.",
				"OAEP-SHA256": "Recommended padding scheme for encryption.",
				PSS: "Recommended padding scheme for signatures.",
			},
		},
		ChaCha20: {
			keyLengths: {
				256: "Strong security level, recommended for all uses.",
			},
			modes: {
				Poly1305: "Recommended AEAD construction.",
			},
		},
		"3DES": {
			keyLengths: {
				168: "HIGH RISK: Vulnerable to Sweet32 attack. Not recommended for new applications.",
			},
			padding: {
				PKCS7:
					"Vulnerable to padding oracle attacks if not implemented properly.",
				ISO10126:
					"Random padding bytes make oracle attacks harder, but still possible.",
				"No Padding":
					"Only suitable for data that is exact multiple of block size.",
			},
		},
	};

	const updateOptions = () => {
		const config = configurations[algorithm];
		setKeyLength(config.keyLengths[0]);
		setMode(config.modes ? config.modes[0] : "");
		setPadding(config.padding ? config.padding[0] : "");
		setAuthTagLength(config.authTagLengths ? config.authTagLengths[0] : "");
	};

	const analyzeConfiguration = () => {
		const config = vulnerabilities[algorithm];
		let report = `<h2>Vulnerability Analysis Report</h2>`;
		report += `<h3>Algorithm: ${algorithm}</h3>`;

		// Add algorithm-specific vulnerabilities
		report += `<h4>Key Length (${keyLength} bits):</h4>`;
		report += `<p>${config.keyLengths[keyLength]}</p>`;

		if (config.modes && mode) {
			report += `<h4>Mode of Operation (${mode}):</h4>`;
			report += `<p>${config.modes[mode]}</p>`;
		}

		if (config.padding && padding) {
			report += `<h4>Padding Scheme (${padding}):</h4>`;
			report += `<p>${config.padding[padding]}</p>`;
		}

		setVulnerabilityReport(report);
	};

	const downloadPDF = () => {
		const doc = new jsPDF();
		const vulns = vulnerabilities[algorithm];

		// Page 1: Executive Summary
		doc.setFontSize(24);
		doc.text("Cryptographic Configuration", 20, 20);
		doc.text("Security Assessment Report", 20, 30);

		doc.setFontSize(12);
		doc.text(`Report Generated: ${new Date().toLocaleString()}`, 20, 45);
		doc.text("Document Classification: CONFIDENTIAL", 20, 55);

		doc.setFontSize(16);
		doc.text("Executive Summary", 20, 70);

		doc.setFontSize(12);
		let execSummary = [
			`This report provides a comprehensive security assessment of the ${algorithm} cryptographic`,
			`configuration with ${keyLength}-bit key length${
				mode ? ", " + mode + " mode" : ""
			}`,
			`${padding ? " and " + padding + " padding" : ""}.`,
			"",
			"Key Findings:",
			`• Algorithm Selection: ${getRiskLevel(algorithm)}`,
			`• Key Length Assessment: ${getRiskLevel(keyLength)}`,
			mode ? `• Mode of Operation: ${getRiskLevel(mode)}` : "",
			padding ? `• Padding Scheme: ${getRiskLevel(padding)}` : "",
		];

		doc.text(execSummary, 20, 85);

		// Page 2: Detailed Configuration Analysis
		doc.addPage();
		doc.setFontSize(20);
		doc.text("Detailed Configuration Analysis", 20, 20);

		doc.setFontSize(16);
		doc.text("Current Configuration", 20, 40);

		doc.setFontSize(12);
		let configDetails = [
			`Algorithm: ${algorithm}`,
			`Key Length: ${keyLength} bits`,
			mode ? `Mode of Operation: ${mode}` : "",
			padding ? `Padding Scheme: ${padding}` : "",
			"",
			"Technical Assessment:",
			vulns.keyLengths[keyLength],
			mode ? vulns.modes[mode] : "",
			padding ? vulns.padding[padding] : "",
		];

		doc.text(configDetails, 20, 55);

		// Page 3: Vulnerability Assessment
		doc.addPage();
		doc.setFontSize(20);
		doc.text("Vulnerability Assessment", 20, 20);

		doc.setFontSize(16);
		doc.text("Known Vulnerabilities", 20, 40);

		doc.setFontSize(12);
		let yPos = 55;

		// Add algorithm-specific vulnerabilities
		let vulnerabilityList = getVulnerabilityList(
			algorithm,
			keyLength,
			mode,
			padding
		);
		vulnerabilityList.forEach((vuln) => {
			doc.text("• " + vuln, 20, yPos);
			yPos += 10;
		});

		// Page 4: Mitigation Strategies
		doc.addPage();
		doc.setFontSize(20);
		doc.text("Mitigation Strategies", 20, 20);

		doc.setFontSize(16);
		doc.text("Recommended Actions", 20, 40);

		doc.setFontSize(12);
		yPos = 55;
		let mitigations = getMitigationStrategies(
			algorithm,
			keyLength,
			mode,
			padding
		);
		mitigations.forEach((mitigation) => {
			doc.text("• " + mitigation, 20, yPos);
			yPos += 10;
		});

		// Implementation Guidelines
		doc.setFontSize(16);
		doc.text("Implementation Guidelines", 20, yPos + 10);

		doc.setFontSize(12);
		yPos += 25;
		let guidelines = getImplementationGuidelines(algorithm);
		guidelines.forEach((guideline) => {
			doc.text("• " + guideline, 20, yPos);
			yPos += 10;
		});

		// Page 5: Industry Standards & Best Practices
		doc.addPage();
		doc.setFontSize(20);
		doc.text("Industry Standards & Best Practices", 20, 20);

		doc.setFontSize(16);
		doc.text("Compliance Requirements", 20, 40);

		doc.setFontSize(12);
		let standards = getIndustryStandards();
		doc.text(standards, 20, 55);

		doc.setFontSize(16);
		doc.text("Future Considerations", 20, 140);

		doc.setFontSize(12);
		let considerations = getFutureConsiderations(algorithm);
		doc.text(considerations, 20, 155);

		// Save the PDF
		doc.save("crypto_security_assessment.pdf");
	};

	useEffect(() => {
		updateOptions();
	}, [algorithm]);

	return (
		<div className="container text-white">
			<h1 className="text-3xl font-bold mb-5">Vulnerability Scanner</h1>

			<div className="section">
				<label>Algorithm Type:</label>
				<select
					value={algorithm}
					onChange={(e) => setAlgorithm(e.target.value)}
					className="text-black"
				>
					<option value="AES">AES</option>
					<option value="RSA">RSA</option>
					<option value="ChaCha20">ChaCha20</option>
					<option value="3DES">3DES</option>
				</select>
			</div>

			<div className="section">
				<label>Key Length:</label>
				<select
					className="text-black"
					value={keyLength}
					onChange={(e) => setKeyLength(e.target.value)}
				>
					{configurations[algorithm]?.keyLengths?.map((length) => (
						<option key={length} value={length}>
							{length} bits
						</option>
					))}
				</select>
			</div>

			{configurations[algorithm]?.modes && (
				<div className="section">
					<label>Mode of Operation:</label>
					<select
						className="text-black"
						value={mode}
						onChange={(e) => setMode(e.target.value)}
					>
						{configurations[algorithm]?.modes?.map((mode) => (
							<option key={mode} value={mode}>
								{mode}
							</option>
						))}
					</select>
				</div>
			)}

			{configurations[algorithm]?.padding && (
				<div className="section">
					<label>Padding Scheme:</label>
					<select
						className="text-black"
						value={padding}
						onChange={(e) => setPadding(e.target.value)}
					>
						{configurations[algorithm]?.padding?.map((pad) => (
							<option key={pad} value={pad}>
								{pad}
							</option>
						))}
					</select>
				</div>
			)}

			{configurations[algorithm]?.authTagLengths && (
				<div className="section">
					<label>Authentication Tag Length:</label>
					<select
						className="text-black"
						value={authTagLength}
						onChange={(e) => setAuthTagLength(e.target.value)}
					>
						{configurations[algorithm]?.authTagLengths?.map((length) => (
							<option key={length} value={length}>
								{length} bits
							</option>
						))}
					</select>
				</div>
			)}

			<button onClick={analyzeConfiguration}>Analyze Configuration</button>

			<div
				id="vulnerabilityReport"
				dangerouslySetInnerHTML={{ __html: vulnerabilityReport }}
			/>

			<button
				onClick={downloadPDF}
				className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
			>
				Download Report as PDF
			</button>
		</div>
	);
};

export default CryptographicConfigSimulator;
