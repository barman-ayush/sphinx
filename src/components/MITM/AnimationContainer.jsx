import React, { useEffect } from 'react';


export const AnimationContainer = ({
  results,
  step,
  setStep
}) => {
  useEffect(() => {
    if (!results) return;

    const animationSteps = [
      {
        time: 0,
        message: "Step 1: Alice sends her public value (Intercepted by Mallory)",
        params: {
          alice: `Initial: g^a = ${results.alicePublic}`,
          mallory: `Intercepted from Alice:<br>g^a = ${results.alicePublic}`,
          bob: `Initial: g^b = ${results.bobPublic}`
        }
      },
      {
        time: 3000,
        message: "Step 2: Mallory sends modified value to Bob",
        params: {
          bob: `Received: g^c = ${results.malloryC}`
        }
      },
      {
        time: 6000,
        message: "Step 3: Bob sends his public value (Intercepted by Mallory)",
        params: {
          mallory: `Intercepted from Bob:<br>g^b = ${results.bobPublic}`
        }
      },
      {
        time: 9000,
        message: "Step 4: Mallory sends modified value to Alice",
        params: {
          alice: `Received: g^d = ${results.malloryD}`
        }
      },
      {
        time: 12000,
        message: "Attack Complete! Mallory can now intercept all communications.",
        params: {
          alice: `Final Keys With Alice: ${results.malloryAlice}`,
          bob: `Final Keys With Bob: ${results.malloryBob}`,
          mallory: `Final Keys:<br>With Alice: ${results.malloryAlice}<br>With Bob: ${results.malloryBob}`
        }
      }
    ];

    animationSteps.forEach(({ time, message, params }) => {
      setTimeout(() => {
        setStep(message);
        Object.entries(params).forEach(([participant, text]) => {
          const element = document.getElementById(`${participant}-params`);
          if (element) element.innerHTML = text;
        });
      }, time);
    });

    return () => {
      // Cleanup timeouts on unmount
      animationSteps.forEach(({ time }) => {
        clearTimeout(time);
      });
    };
  }, [results, setStep]);

  return (
    <div className="animation-container">
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
      <div className="step-display" id="step-display">
        {step}
      </div>
    </div>
  );
};