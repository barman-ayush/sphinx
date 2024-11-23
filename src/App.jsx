import { Fragment, useEffect, useState } from "react";
import "./App.css";
import { ThemeProvider } from "./Context/Theme";

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

      </Fragment>
    </ThemeProvider>
  );
}

export default App;
