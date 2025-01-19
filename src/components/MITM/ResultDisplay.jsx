import React from "react";

export const ResultDisplay = ({ results, publicValues, privateValues }) => {
	return (
		<div className="result bg-gray-900">
			<div
				style={{
					padding: "15px",
					borderRadius: "5px",
				}}
				className="bg-gray-900"
			>
				<h3>Attack Summary:</h3>
				<p>
					<strong>Initial Parameters:</strong>
				</p>
				<ul>
					<li>Prime (p) = {publicValues.p}</li>
					<li>Primitive Root (g) = {publicValues.g}</li>
				</ul>
				<p>
					<strong>Private Keys:</strong>
				</p>
				<ul>
					<li>Alice's private key (a) = {privateValues.a}</li>
					<li>Bob's private key (b) = {privateValues.b}</li>
					<li>
						Mallory's private keys: c = {privateValues.c}, d = {privateValues.d}
					</li>
				</ul>
				<p>
					<strong>Final Keys:</strong>
				</p>
				<ul>
					<li>Alice-Mallory shared key: {results.aliceFinal}</li>
					<li>Bob-Mallory shared key: {results.bobFinal}</li>
				</ul>
				<p style={{ color: "#dc3545", fontWeight: "bold" }}>
					Attack Successful! Mallory can now intercept and decrypt all messages
					between Alice and Bob.
				</p>
			</div>
		</div>
	);
};
