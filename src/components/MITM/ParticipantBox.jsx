import React from 'react';

export const ParticipantBox = ({
  title,
  privateKey,
  privateKeyC,
  privateKeyD,
  onPrivateKeyChange,
  onPrivateKeyCChange,
  onPrivateKeyDChange,
  publicValue,
  finalKey,
  results
}) => {
  if (title === "Mallory (MITM)") {
    return (
      <div className="box">
        <h3>{title}</h3>
        <div className="input-group">
          <label>
            Private Key (c): 
            <input 
              type="number" 
              value={privateKeyC} 
              onChange={(e) => onPrivateKeyCChange?.(parseInt(e.target.value))} 
            />
          </label>
          <label>
            Private Key (d): 
            <input 
              type="number" 
              value={privateKeyD} 
              onChange={(e) => onPrivateKeyDChange?.(parseInt(e.target.value))} 
            />
          </label>
        </div>
        {results && (
          <div className="value-display">
            <strong>Intercepted Values:</strong><br />
            From Alice: {results.alicePublic}<br />
            From Bob: {results.bobPublic}<br /><br />
            <strong>Generated Values:</strong><br />
            For Alice (g^d): {results.malloryD}<br />
            For Bob (g^c): {results.malloryC}<br /><br />
            <strong>Computed Keys:</strong><br />
            With Alice: {results.malloryAlice}<br />
            With Bob: {results.malloryBob}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="box">
      <h3>{title}</h3>
      <div className="input-group">
        <label>
          Private Key ({title === "Alice" ? "a" : "b"}): 
          <input 
            type="number" 
            value={privateKey} 
            onChange={(e) => onPrivateKeyChange?.(parseInt(e.target.value))} 
          />
        </label>
      </div>
      {publicValue && (
        <div className="value-display">
          <strong>Public Value:</strong><br />
          g^{title === "Alice" ? "a" : "b"} mod p = {publicValue}
        </div>
      )}
      {finalKey && (
        <div className="value-display">
          <strong>Final Key:</strong><br />
          {title === "Alice" ? "(g^d)^a" : "(g^c)^b"} mod p = {finalKey}
        </div>
      )}
    </div>
  );
};