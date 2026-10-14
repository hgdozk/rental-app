import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./styles/base/reset.css";
import "./styles/base/base.css";

import RentPage from "./pages/RentPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import NewsPage from "./pages/NewsPage.jsx";
import Properties from "./pages/Properties.jsx";
import All from "./pages/All.jsx";
import Favorites from "./pages/Favorites.jsx";
import CreateProperty from "./pages/CreateProperty.jsx";
import RealtorDashboard from "./pages/RealtorDashboard.jsx";
import PropertyDetails from "./pages/PropertyDetails.jsx";
import Chat from "./pages/Chat.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import RealtorsPage from "./pages/RealtorsPage.jsx";

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RentPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/all" element={<All />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/create-property" element={<CreateProperty />} />
          <Route path="/realtor-dashboard" element={<RealtorDashboard />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/cart" element={<MyBookings />} />
          <Route path="/realtors" element={<RealtorsPage />} />
        </Routes>
      </BrowserRouter>
    </StrictMode>
  );
}
