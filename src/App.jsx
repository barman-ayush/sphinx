import { Fragment, useEffect, useState } from "react";
import "./App.css";
import { ThemeProvider } from "./Context/Theme";
import { Route, Routes } from "react-router-dom";
import SHA from "./components/SHA";
import Navbar from "./components/Navbar.jsx";
import MITM from "./components/MITM/MITM.jsx";
import CCS from "./components/CCS.jsx";
import STT from "./components/STT.jsx";
import CTF from "./components/CTF.jsx";
import RSAVisualizer from "./components/RSAVisualizer.jsx";
import RSAVizMap from "./components/RSAVizMap.jsx";

function App() {
	// Theme controllers
	const [themeMode, setThemeMode] = useState("light");
	const darkTheme = () => setThemeMode("dark");
	const lightTheme = () => setThemeMode("light");

	useEffect(() => {
		document.querySelector("html").classList.remove("light", "dark");
		document.querySelector("html").classList.add(themeMode);
	}, [themeMode]);

	return (
		<ThemeProvider value={{ darkTheme, lightTheme, themeMode }}>
			<Fragment>
				<Navbar>
					<Routes>
						<Route path="/" element={<SHA />} />
						<Route path="/MITM" element={<MITM />} />
						<Route path="/CCS" element={<CCS />} />
						<Route path="/STT" element={<STT />} />
						<Route path="/CTF" element={<CTF />} />
						<Route path="/RSA" element={<RSAVisualizer />} />
						<Route path="RSA-VIZ" element={<RSAVizMap />} />
						<Route path="/CTF" element={<CTF />} />
					</Routes>
				</Navbar>
			</Fragment>
		</ThemeProvider>
	);
}

export default App;
