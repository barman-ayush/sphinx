import React, { Fragment } from "react";
import "./styles.css"

const MITM = () => {
  // All JavaScript functions remain exactly the same
  function modPow(base, exponent, modulus) {
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

  function createMessage(className, text, startPosition) {
    const msg = document.createElement("div");
    msg.className = `message ${className}`;
    msg.textContent = text;
    msg.style.top = "75px";
    msg.style.left = startPosition + "px";
    return msg;
  }

  function updateStepDisplay(text) {
    document.getElementById("step-display").textContent = text;
  }

  function updateParameters(participant, text) {
    document.getElementById(`${participant}-params`).innerHTML = text;
  }

  function animateExchange(
    alicePublic,
    bobPublic,
    malloryC,
    malloryD,
    malloryAlice,
    malloryBob
  ) {
    const container = document.querySelector(".animation-container");

    // Initial values
    updateParameters("alice", `Initial: g^a = ${alicePublic}`);
    updateParameters("bob", `Initial: g^b = ${bobPublic}`);

    // Step 1: Alice to Mallory
    setTimeout(() => {
      updateStepDisplay(
        "Step 1: Alice sends her public value (Intercepted by Mallory)"
      );
      updateParameters(
        "mallory",
        `Intercepted from Alice:<br>g^a = ${alicePublic}`
      );
      const msg = createMessage("alice-message", `g^a = ${alicePublic}`, 150);
      container.appendChild(msg);
      msg.classList.add("animate-right");
      setTimeout(() => container.removeChild(msg), 3000);
    }, 0);

    // Step 2: Mallory to Bob
    setTimeout(() => {
      updateStepDisplay("Step 2: Mallory sends modified value to Bob");
      updateParameters("bob", `Received: g^c = ${malloryC}`);
      const msg = createMessage("mallory-message", `g^c = ${malloryC}`, 500);
      container.appendChild(msg);
      msg.classList.add("animate-right");
      setTimeout(() => container.removeChild(msg), 3000);
    }, 3000);

    // Step 3: Bob to Mallory
    setTimeout(() => {
      updateStepDisplay(
        "Step 3: Bob sends his public value (Intercepted by Mallory)"
      );
      updateParameters(
        "mallory",
        `Intercepted from Bob:<br>g^b = ${bobPublic}`
      );
      const msg = createMessage("bob-message", `g^b = ${bobPublic}`, 850);
      container.appendChild(msg);
      msg.classList.add("animate-left");
      setTimeout(() => container.removeChild(msg), 3000);
    }, 6000);

    // Step 4: Mallory to Alice
    setTimeout(() => {
      updateStepDisplay("Step 4: Mallory sends modified value to Alice");
      updateParameters("alice", `Received: g^d = ${malloryD}`);
      const msg = createMessage("mallory-message", `g^d = ${malloryD}`, 500);
      container.appendChild(msg);
      msg.classList.add("animate-left");
      setTimeout(() => container.removeChild(msg), 3000);
    }, 9000);

    setTimeout(() => {
      updateStepDisplay(
        "Attack Complete! Mallory can now intercept all communications."
      );
      updateParameters("alice", `Final Keys With Alice: ${malloryAlice}`);
      updateParameters("bob", `Final Keys With Bob: ${malloryBob}`);
    }, 12000);

    // Final step
    setTimeout(() => {
      updateStepDisplay(
        "Attack Complete! Mallory can now intercept all communications."
      );
      updateParameters(
        "mallory",
        `Final Keys:<br>With Alice: ${malloryAlice}<br>With Bob: ${malloryBob}`
      );
    }, 12000);
  }

  function simulate() {
    try {
      // Get input values
      const p = parseInt(document.getElementById("prime").value);
      const g = parseInt(document.getElementById("primitive_root").value);
      const a = parseInt(document.getElementById("alice-private").value);
      const b = parseInt(document.getElementById("bob-private").value);
      const c = parseInt(document.getElementById("mallory-c").value);
      const d = parseInt(document.getElementById("mallory-d").value);

      // Validate inputs
      if (!p || !g || !a || !b || !c || !d) {
        alert("Please fill in all values");
        return;
      }

      // Calculate public values
      const alicePublic = modPow(g, a, p);
      const bobPublic = modPow(g, b, p);
      const malloryC = modPow(g, c, p);
      const malloryD = modPow(g, d, p);

      // Calculate final keys
      const aliceFinal = modPow(malloryD, a, p);
      const bobFinal = modPow(malloryC, b, p);
      const malloryAlice = modPow(alicePublic, d, p);
      const malloryBob = modPow(bobPublic, c, p);

      // Start animation
      animateExchange(
        alicePublic,
        bobPublic,
        malloryC,
        malloryD,
        malloryAlice,
        malloryBob
      );

      // Display results
      document.getElementById(
        "alice-public"
      ).innerHTML = `<strong>Public Value:</strong><br>g^a mod p = ${alicePublic}`;

      document.getElementById(
        "alice-final"
      ).innerHTML = `<strong>Final Key:</strong><br>(g^d)^a mod p = ${aliceFinal}`;

      document.getElementById(
        "bob-public"
      ).innerHTML = `<strong>Public Value:</strong><br>g^b mod p = ${bobPublic}`;

      document.getElementById(
        "bob-final"
      ).innerHTML = `<strong>Final Key:</strong><br>(g^c)^b mod p = ${bobFinal}`;

      document.getElementById("mallory-results").innerHTML = `
                <strong>Intercepted Values:</strong><br>
                From Alice: ${alicePublic}<br>
                From Bob: ${bobPublic}<br><br>
                <strong>Generated Values:</strong><br>
                For Alice (g^d): ${malloryD}<br>
                For Bob (g^c): ${malloryC}<br><br>
                <strong>Computed Keys:</strong><br>
                With Alice: ${malloryAlice}<br>
                With Bob: ${malloryBob}
            `;

      document.getElementById("result").innerHTML = `
                <div style="background-color: #c8a0ed; padding: 15px; border-radius: 5px;">
                    <h3>Attack Summary:</h3>
                    <p><strong>Initial Parameters:</strong></p>
                    <ul>
                        <li>Prime (p) = ${p}</li>
                        <li>Primitive Root (g) = ${g}</li>
                    </ul>
                    <p><strong>Private Keys:</strong></p>
                    <ul>
                        <li>Alice's private key (a) = ${a}</li>
                        <li>Bob's private key (b) = ${b}</li>
                        <li>Mallory's private keys: c = ${c}, d = ${d}</li>
                    </ul>
                    <p><strong>Final Keys:</strong></p>
                    <ul>
                        <li>Alice-Mallory shared key: ${aliceFinal}</li>
                        <li>Bob-Mallory shared key: ${bobFinal}</li>
                    </ul>
                    <p style="color: #dc3545; font-weight: bold;">
                        Attack Successful! Mallory can now intercept and decrypt all messages between Alice and Bob.
                    </p>
                </div>
            `;
    } catch (error) {
      console.error("Error in simulation:", error);
      alert(
        "An error occurred during simulation. Check the console for details."
      );
    }
  }

  function reset() {
    document.getElementById("alice-public").innerHTML = "";
    document.getElementById("alice-final").innerHTML = "";
    document.getElementById("bob-public").innerHTML = "";
    document.getElementById("bob-final").innerHTML = "";
    document.getElementById("mallory-results").innerHTML = "";
    document.getElementById("result").innerHTML = "";
    document.getElementById("step-display").textContent = "";
    updateParameters("alice", "Initial: g^a = -");
    updateParameters("mallory", "Intercepted: -");
    updateParameters("bob", "Initial: g^b = -");
  }

  return (
    <div className="container bg-gray-900 px-3 py-3 text-white" style={{ borderRadius : "10px"}}>
      <h1>Diffie-Hellman MITM Attack Simulator</h1>

      <div className="input-group" >
        <h3>Public Values:</h3>
        <label>
          Prime (p): <input type="number" id="prime" className="text-black" defaultValue="23" />
        </label>
        <label>
          Primitive Root (g):
          <input type="number" id="primitive_root" className="text-black" defaultValue="5" />
        </label>
      </div>

      <div className="grid">
        <div className="box text-black  bg-fuchsia-800"  >
          <h3>Alice</h3>
          <div className="input-group">
            <label>
              Private Key (a):
              <input type="number" id="alice-private" className="text-black" defaultValue="6" />
            </label>
          </div>
          <div id="alice-public" className="value-display"></div>
          <div id="alice-final" className="value-display"></div>
        </div>

        <div className="box text-black">
          <h3>Mallory (MITM)</h3>
          <div className="input-group">
            <label>
              Private Key (c):
              <input type="number" id="mallory-c" className="text-black" defaultValue="4" />
            </label>
            <label>
              Private Key (d):
              <input type="number" id="mallory-d" className="text-black" defaultValue="7" />
            </label>
          </div>
          <div id="mallory-results" className="value-display"></div>
        </div>

        <div className="box text-black">
          <h3>Bob</h3>
          <div className="input-group">
            <label>
              Private Key (b):
              <input type="number" id="bob-private" defaultValue="8" className="text-black" />
            </label>
          </div>
          <div id="bob-public" className="value-display"></div>
          <div id="bob-final" className="value-display"></div>
        </div>
      </div>

      <div className="animation-container bg-slate-700">
        <div className="path-line"></div>
        <div className="participant alice">Alice</div>
        <div className="participant mallory">Mallory</div>
        <div className="participant bob">Bob</div>
        <div className="parameter-display alice-params" id="alice-params">
          Initial: g^a = -
        </div>
        <div className="parameter-display mallory-params" id="mallory-params">
          Intercepted: -
        </div>
        <div className="parameter-display bob-params" id="bob-params">
          Initial: g^b = -
        </div>
        <div className="step-display" id="step-display"></div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button onClick={simulate}>Simulate Attack</button>
        <button onClick={reset}>Reset</button>
      </div>

      <div className="result" id="result"></div>
    </div>
  );
};

export default MITM;