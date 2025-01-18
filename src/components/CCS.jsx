import React, { useState, useEffect } from "react";
import "./CCS.css";

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

const CCS = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("AES");
  const [keyLength, setKeyLength] = useState("");
  const [mode, setMode] = useState("");
  const [padding, setPadding] = useState("");
  const [authTagLength, setAuthTagLength] = useState("");
  const [report, setReport] = useState("");

  useEffect(() => {
    updateOptions();
  }, [selectedAlgorithm]);

  const updateOptions = () => {
    const config = configurations[selectedAlgorithm];

    setKeyLength(config.keyLengths[0] || "");
    setMode(config.modes ? config.modes[0] : "");
    setPadding(config.padding ? config.padding[0] : "");
    setAuthTagLength(config.authTagLengths ? config.authTagLengths[0] : "");
  };

  const analyzeConfiguration = () => {
    const vulns = vulnerabilities[selectedAlgorithm];
    let analysisReport = `<h2>Vulnerability Analysis Report</h2>`;
    analysisReport += `<h3>Algorithm: ${selectedAlgorithm}</h3>`;

    analysisReport += `<h4>Key Length (${keyLength} bits):</h4>`;
    analysisReport += `<p>${vulns.keyLengths[keyLength]}</p>`;

    if (vulns.modes && mode) {
      analysisReport += `<h4>Mode of Operation (${mode}):</h4>`;
      analysisReport += `<p>${vulns.modes[mode]}</p>`;
    }

    if (vulns.padding && padding) {
      analysisReport += `<h4>Padding Scheme (${padding}):</h4>`;
      analysisReport += `<p>${vulns.padding[padding]}</p>`;
    }

    analysisReport += `<h4>Potential Attacks:</h4><ul>`;
    if (selectedAlgorithm === "RSA" && keyLength <= 2048) {
      analysisReport += `<li>Vulnerable to factorization attacks using quantum computers</li>`;
      if (keyLength === 1024) {
        analysisReport += `<li>Potentially vulnerable to factorization using specialized hardware</li>`;
      }
    }
    if (selectedAlgorithm === "AES" && mode === "ECB") {
      analysisReport += `<li>Pattern analysis attacks</li>`;
      analysisReport += `<li>Replay attacks</li>`;
    }
    if (selectedAlgorithm === "3DES") {
      analysisReport += `<li>Sweet32 birthday attacks</li>`;
      analysisReport += `<li>Meet-in-the-middle attacks</li>`;
    }
    analysisReport += `</ul>`;

    setReport(analysisReport);
  };

  return (
    <div
      className="container bg-gray-900 mt-0 absolute px-4 py-4 text-white"
      style={{ top: "15%", width: "93%", borderRadius: "10px" }}
    >
      <h1 className="font-bold mb-5 text-lg">
        Cryptographic Configuration Simulator
      </h1>

      <div className="section">
        <label>Algorithm Type:</label>
        <select
          className="text-black"
          value={selectedAlgorithm}
          onChange={(e) => setSelectedAlgorithm(e.target.value)}
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
          {configurations[selectedAlgorithm].keyLengths &&
            configurations[selectedAlgorithm].keyLengths.map((length) => (
              <option key={length} value={length}>
                {length} bits
              </option>
            ))}
        </select>
      </div>

      {configurations[selectedAlgorithm].modes && (
        <div className="section">
          <label>Mode of Operation:</label>
          <select
            className="text-black"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            {configurations[selectedAlgorithm].modes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      )}

      {configurations[selectedAlgorithm].padding && (
        <div className="section">
          <label>Padding Scheme:</label>
          <select
            className="text-black"
            value={padding}
            onChange={(e) => setPadding(e.target.value)}
          >
            {configurations[selectedAlgorithm].padding.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      )}

      {configurations[selectedAlgorithm].authTagLengths && (
        <div className="section">
          <label>Authentication Tag Length:</label>
          <select
            className="text-black"
            value={authTagLength}
            onChange={(e) => setAuthTagLength(e.target.value)}
          >
            {configurations[selectedAlgorithm].authTagLengths.map((length) => (
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
        dangerouslySetInnerHTML={{ __html: report }}
      ></div>
    </div>
  );
};

export default CCS;
