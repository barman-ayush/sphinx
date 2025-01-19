import React, { useState } from "react";

const ChallengeComponent = ({ topic, desc, files, onSubmitFlag }) => {
  const [flagInput, setFlagInput] = useState("");

  const handleDownload = (fileUrl) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.setAttribute("download", ""); // Sets the download attribute to force download
    link.style.display = "none"; // Hide the link element
    document.body.appendChild(link); // Append the link to the body
    link.click(); // Programmatically click the link
    document.body.removeChild(link); // Remove the link after downloading
  };
  

  const handleSubmit = () => {
    onSubmitFlag(flagInput); // Submit the flag to a parent component or backend
    setFlagInput(""); // Clear the input field
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "1rem",
        margin: "1rem",
        borderRadius: "5px",
        color : "white"
      }}
    >
      <h2>Topic: {topic}</h2>
      <p>{desc}</p>
      <div>
        <h3>Files to Download:</h3>
        {files.map((fileUrl, index) => (
          <button
            key={index}
            style={{
              margin: "0.5rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
            }}
            onClick={() => handleDownload(fileUrl)}
          >
            Download File {index + 1}
          </button>
        ))}
      </div>
      <div style={{ marginTop: "1rem" }}>
        <h3>Submit Flag:</h3>
        <input
          type="text"
          value={flagInput}
          onChange={(e) => setFlagInput(e.target.value)}
          placeholder="Enter flag"
          style={{
            padding: "0.5rem",
            marginRight: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "3px",
            width: "70%",
            color : "black"
          }}
        />
        <button
          onClick={handleSubmit}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

// Example Usage
const CTF = () => {
    const challenges = [
        {
          topic: "RSA",
          desc: "Why is everyone so obsessed with multiplying two primes for RSA. Why not just use one?",
          files: [
            "https://cryptohack.org/static/challenges/output_086036e35349a406b94bfac9a7af6cca.txt"
          ],
          flag: "crypto{0n3_pr1m3_41n7_pr1m3_l0l}"
        },
        {
          topic: "RSA", 
          desc: "Im lazyyyy, I don wanna calculate bigger exponents",
          files: [
            "https://cryptohack.org/static/challenges/salty_9854bdcadc3f8b8f58008a24d392c1bf.py",
            "https://cryptohack.org/static/challenges/output_95f558e889cc66920c24a961f1fb8181.txt"
          ],
          flag: "crypto{saltstack_fell_for_this!}"
        },
        {
          topic: "RSA",
          desc: "I've found a super fast way to generate primes from my secret list.",
          files: [
            "https://cryptohack.org/static/challenges/marin_06e647881a0f6f2480d48c7f18f0274e.py",
            "https://cryptohack.org/static/challenges/output_f194012343666ced1a6699d196c8adc5.txt"
          ],
          flag: "crypto{Th3se_Pr1m3s_4r3_t00_r4r3}"
        },
        {
          topic: "RSA",
          desc: "I asked my friends to encrypt our secret flag before sending it to me, but instead of using my key, they've all used their own! Can you help?",
          files: [
            "https://cryptohack.org/static/challenges/source_b3c3c786c649d363d27995545cf95dab.py",
            "https://cryptohack.org/static/challenges/output_434cbf2b937bac1177bed299b2049a92.txt"
          ],
          flag: "crypto{3ncrypt_y0ur_s3cr3t_w1th_y0ur_fr1end5_publ1c_k3y}"
        },
        {
          topic: "MATH",
          desc: "Adrien's been looking at ways to encrypt his messages with the help of symbols and minus signs. Can you find a way to recover the flag?",
          files: [
            "https://cryptohack.org/static/challenges/source_734d7e14251f950935f83d228f8694ab.py",
            "https://cryptohack.org/static/challenges/output_80fc6398d2fd9f272186d0af510323f9.txt"
          ],
          flag: "crypto{p4tterns_1n_re5idu3s}"
        }
    ];

  const handleFlagSubmission = (flag) => {
    console.log("Submitted flag:", flag);

    // Generate a random number
    const randomNumber = Math.floor(Math.random() * 100); // Random number between 0 and 99

    if (randomNumber % 2 === 1) {
      alert(`Correct! You solved it correctly. Random number: ${randomNumber}`);
    } else {
      alert(`Incorrect! Try again. Random number: ${randomNumber}`);
    }
  };

  return (
    <div>
      <h1 className="text-white">Cryptography Challenges</h1>
      {challenges.map((challenge, index) => (
        <ChallengeComponent
          key={index}
          topic={challenge.topic}
          desc={challenge.desc}
          files={challenge.files}
          onSubmitFlag={handleFlagSubmission}
        />
      ))}
    </div>
  );
};

export default CTF;
