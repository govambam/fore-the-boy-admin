import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Scorecard } from "./pages/Scorecard";
import { HoleEdit } from "./pages/HoleEdit";
import { NotFound } from "./pages/NotFound";
import "./global.css";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scorecard/:round" element={<Scorecard />} />
          <Route path="/hole/:round/:hole" element={<HoleEdit />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
