import React, { useState, useEffect } from 'react';
import { Fragment } from 'react';

// SecurityToolkit class remains mostly the same but converted to a regular class
class SecurityToolkit {
  constructor() {
    this.vulnerableConfigs = {
      algorithms: {
        DES: {
          risk: "critical",
          issues: ["Broken algorithm", "Vulnerable to brute force", "Should never be used"]
        },
        RC4: {
          risk: "critical",
          issues: ["Multiple cryptographic weaknesses", "Prohibited in TLS"]
        },
        MD5: {
          risk: "critical",
          issues: ["Cryptographically broken", "Vulnerable to collisions"]
        },
        "3DES": {
          risk: "high",
          issues: ["Legacy algorithm", "Performance issues", "Sweet32 vulnerability"]
        }
      },
      keyLengths: {
        RSA: {
          512: {
            risk: "critical",
            issues: ["Easily factored", "Completely insecure"]
          },
          1024: {
            risk: "high",
            issues: ["Below minimum recommendations", "Potentially factored by state actors"]
          },
          2048: {
            risk: "medium",
            issues: ["Minimum recommended length", "May need upgrade in future"]
          }
        },
        AES: {
          128: {
            risk: "low",
            issues: ["Sufficient for most current applications"]
          },
          256: { risk: "none", issues: [] }
        }
      },
      modes: {
        ECB: {
          risk: "critical",
          issues: ["Does not provide semantic security", "Reveals patterns in data"]
        }
      }
    };
  }

  generateJWT(algorithm, payload, secret) {
    const header = {
      alg: algorithm,
      typ: "JWT"
    };

    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));

    let signature = "";
    if (algorithm === "none") {
      signature = "";
    } else {
      signature = this.simulateSignature(algorithm, `${encodedHeader}.${encodedPayload}`, secret);
    }

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  simulateSignature(algorithm, data, secret) {
    return btoa(`signed-with-${algorithm}-${secret}`);
  }

  analyzeJWT(token) {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        return {
          valid: false,
          issues: ["Invalid JWT format"]
        };
      }

      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));

      const issues = [];
      const warnings = [];

      if (header.alg === "none") {
        issues.push('Algorithm "none" is extremely vulnerable');
      }
      if (header.alg === "HS256") {
        warnings.push("HS256 requires secure key management");
      }

      if (!payload.exp) {
        warnings.push("No expiration claim (exp) found");
      } else if (payload.exp < Date.now() / 1000) {
        issues.push("Token has expired");
      }

      return {
        valid: true,
        header,
        payload,
        issues,
        warnings
      };
    } catch (error) {
      return {
        valid: false,
        issues: ["Invalid token format or encoding"]
      };
    }
  }

  analyzeConfiguration(config) {
    const issues = [];
    const warnings = [];
    let riskLevel = "low";

    if (this.vulnerableConfigs.algorithms[config.algorithm]) {
      const vulnInfo = this.vulnerableConfigs.algorithms[config.algorithm];
      issues.push(...vulnInfo.issues);
      riskLevel = this.upgradeRisk(riskLevel, vulnInfo.risk);
    }

    if (this.vulnerableConfigs.keyLengths[config.algorithm]?.[config.keyLength]) {
      const keyLengthInfo = this.vulnerableConfigs.keyLengths[config.algorithm][config.keyLength];
      issues.push(...keyLengthInfo.issues);
      riskLevel = this.upgradeRisk(riskLevel, keyLengthInfo.risk);
    }

    if (this.vulnerableConfigs.modes[config.mode]) {
      const modeInfo = this.vulnerableConfigs.modes[config.mode];
      issues.push(...modeInfo.issues);
      riskLevel = this.upgradeRisk(riskLevel, modeInfo.risk);
    }

    if (config.padding === "PKCS1v1.5") {
      warnings.push("PKCS1v1.5 padding is vulnerable to padding oracle attacks");
      riskLevel = this.upgradeRisk(riskLevel, "medium");
    }

    return { riskLevel, issues, warnings };
  }

  upgradeRisk(currentRisk, newRisk) {
    const riskLevels = ["low", "medium", "high", "critical"];
    const currentIndex = riskLevels.indexOf(currentRisk);
    const newIndex = riskLevels.indexOf(newRisk);
    return riskLevels[Math.max(currentIndex, newIndex)];
  }
}

const STT = () => {
  const [activeTab, setActiveTab] = useState('jwtTools');
  const [jwtState, setJwtState] = useState({
    algorithm: 'none',
    payload: '{\n  "sub": "1234567890",\n  "name": "Test User",\n  "iat": 1516239022\n}',
    secret: 'your-256-bit-secret',
    output: '',
  });
  const [jwtAnalysis, setJwtAnalysis] = useState({
    input: '',
    result: null
  });

  const securityToolkit = new SecurityToolkit();

  const handleGenerateJWT = () => {
    try {
      const payload = JSON.parse(jwtState.payload);
      const token = securityToolkit.generateJWT(jwtState.algorithm, payload, jwtState.secret);
      setJwtState(prev => ({ ...prev, output: token }));
    } catch (error) {
      setJwtState(prev => ({ ...prev, output: `Error: ${error.message}` }));
    }
  };

  const handleAnalyzeJWT = () => {
    const analysis = securityToolkit.analyzeJWT(jwtAnalysis.input);
    setJwtAnalysis(prev => ({ ...prev, result: analysis }));
  };

  return (
    <div className="container-fluid py-4 bg-gray-900 px-4 text-white" style={{borderRadius : "10px"}}>
      <h1 className="text-center mb-4">Security Testing Toolkit</h1>

      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'jwtTools' ? 'active' : ''}`}
            onClick={() => setActiveTab('jwtTools')}
          >
            JWT Tools
          </button>
        </li>
      </ul>

      <div className="tab-content mt-3">
        {activeTab === 'jwtTools' && (
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">JWT Generator (Including Weak Algorithms)</div>
                <div className="card-body">
                  <div className="mb-3">
                    <label>Algorithm:</label>
                    <select 
                      className="form-select"
                      value={jwtState.algorithm}
                      onChange={(e) => setJwtState(prev => ({ ...prev, algorithm: e.target.value }))}
                    >
                      <option value="none">none (Vulnerable)</option>
                      <option value="HS256">HS256</option>
                      <option value="HS384">HS384</option>
                      <option value="HS512">HS512</option>
                      <option value="RS256">RS256</option>
                      <option value="RS384">RS384</option>
                      <option value="RS512">RS512</option>
                      <option value="ES256">ES256</option>
                      <option value="ES384">ES384</option>
                      <option value="ES512">ES512</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label>Payload:</label>
                    <textarea
                      className="form-control"
                      rows={5}
                      value={jwtState.payload}
                      onChange={(e) => setJwtState(prev => ({ ...prev, payload: e.target.value }))}
                    />
                  </div>

                  <div className="mb-3">
                    <label>Secret/Key:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={jwtState.secret}
                      onChange={(e) => setJwtState(prev => ({ ...prev, secret: e.target.value }))}
                    />
                  </div>

                  <button onClick={handleGenerateJWT} className="btn btn-primary">
                    Generate JWT
                  </button>
                  
                  {jwtState.output && (
                    <div className="code-block mt-3 p-3 bg-light">
                      <code>{jwtState.output}</code>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card">
                <div className="card-header">JWT Analyzer</div>
                <div className="card-body">
                  <div className="mb-3">
                    <label>JWT Token:</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Paste JWT token here"
                      value={jwtAnalysis.input}
                      onChange={(e) => setJwtAnalysis(prev => ({ ...prev, input: e.target.value }))}
                    />
                  </div>
                  
                  <button onClick={handleAnalyzeJWT} className="btn btn-primary">
                    Analyze JWT
                  </button>

                  {jwtAnalysis.result && (
                    <div className="mt-3">
                      <div className="card">
                        <div className="card-header">
                          JWT Analysis Result
                        </div>
                        <div className="card-body">
                          {jwtAnalysis.result.valid ? (
                            <>
                              <h5>Header:</h5>
                              <pre>{JSON.stringify(jwtAnalysis.result.header, null, 2)}</pre>
                              <h5>Payload:</h5>
                              <pre>{JSON.stringify(jwtAnalysis.result.payload, null, 2)}</pre>
                              
                              {jwtAnalysis.result.issues.length > 0 && (
                                <>
                                  <h5 className="text-danger">Issues:</h5>
                                  <ul className="text-danger">
                                    {jwtAnalysis.result.issues.map((issue, index) => (
                                      <li key={index}>{issue}</li>
                                    ))}
                                  </ul>
                                </>
                              )}

                              {jwtAnalysis.result.warnings.length > 0 && (
                                <>
                                  <h5 className="text-warning">Warnings:</h5>
                                  <ul className="text-warning">
                                    {jwtAnalysis.result.warnings.map((warning, index) => (
                                      <li key={index}>{warning}</li>
                                    ))}
                                  </ul>
                                </>
                              )}
                            </>
                          ) : (
                            <div className="text-danger">
                              <ul>
                                {jwtAnalysis.result.issues.map((issue, index) => (
                                  <li key={index}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default STT;