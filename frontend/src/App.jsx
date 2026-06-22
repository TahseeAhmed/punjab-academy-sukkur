import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

import StudentsPage from "./pages/shared/StudentsPage";
import AttendancePage from "./pages/shared/AttendancePage";
import FeesPage from "./pages/shared/FeesPage";
import AcademicsPage from "./pages/shared/AcademicsPage";
import NoticesPage from "./pages/shared/NoticesPage";
import ChangePasswordPage from "./pages/shared/ChangePasswordPage";

import TeachersPage from "./pages/admin/TeachersPage";
import ClassesPage from "./pages/admin/ClassesPage";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: "#211f1a", color: "#fff", fontSize: "14px" },
              success: { iconTheme: { primary: "#2d6a4f", secondary: "#fff" } },
              error: { iconTheme: { primary: "#b3261e", secondary: "#fff" } },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/students"
              element={
                <ProtectedRoute roles={["admin", "teacher"]}>
                  <StudentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teachers"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <TeachersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/classes"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <ClassesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute roles={["admin", "teacher", "student"]}>
                  <AttendancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fees"
              element={
                <ProtectedRoute roles={["admin", "student"]}>
                  <FeesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/academics"
              element={
                <ProtectedRoute roles={["admin", "teacher", "student"]}>
                  <AcademicsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notices"
              element={
                <ProtectedRoute roles={["admin", "teacher", "student"]}>
                  <NoticesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/change-password"
              element={
                <ProtectedRoute roles={["admin", "teacher", "student"]}>
                  <ChangePasswordPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
