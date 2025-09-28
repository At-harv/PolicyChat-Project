import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TailwindLoginForm from "./components/TailwindLoginForm";
import TailwindSignUpForm from "./components/TailwindSignUpForm";
import PolicyChatDashboard from "./components/PolicyChatDashboard";
import MyPolicies from "./components/MyPolicies";
import AddPolicyModal from "./components/AddPolicyModal";
import PolicyDetails from "./components/PolicyDetails";
import Chat from "./components/chatbot";
import MainLayout from "./components/mainlayout"; // ✅ import layout

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<TailwindLoginForm />} />
        <Route path="/login" element={<TailwindLoginForm />} />
        <Route path="/signup" element={<TailwindSignUpForm />} />

        {/* Protected Routes (with sidebar) */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<PolicyChatDashboard />} />
          <Route path="/policies" element={<MyPolicies />} />
          <Route path="/addpolicy" element={<AddPolicyModal />} />
          <Route path="/policies/:id" element={<PolicyDetails />} />
          <Route path="/chat" element={<Chat />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
