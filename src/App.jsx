import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import LandingPage from "./LandingPage";
import Builder from "./Builder";
import TemplatePicker from "./TemplatePicker";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/templates" element={<TemplatePicker />} />
          <Route path="/builder" element={<Builder />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
