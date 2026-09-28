import { Toaster } from "react-hot-toast";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login/Login";
import AuthGuard from "./components/AuthGuard/AuthGuard";
import Layout from "./components/Layout/Layout";
import LayoutForm from "./components/Layout/LayoutForm"
import AdminLayout from "./components/AdminLayout/AdminLayout"
import UserManagement from "./pages/UserManagement/UserManagement"
import AdminForm from "./pages/AdminForm/AdminForm"
import FormManagement from "./pages/Selection/SelectionPage"
import Evaluation from "./pages/Evaluation/Evaluation";
import EditEvaluation from "./pages/Evaluation/EditEvaluation";
import EmployeeManagement from "./pages/EmployeeManagement/EmployeeManagement";

import './index.css'
import './styles/websocket.css';

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Routes>
              <Route path="/" element={
                  <AuthGuard requireAuth={false}>
                      <Navigate to="/login" replace />
                  </AuthGuard>
              } />

              <Route path="/login" element={
                  <AuthGuard requireAuth={false}>
                      <Login />
                  </AuthGuard>
              } />

              <Route
                path="/admin"
                element={
                    <AuthGuard>
                        <AdminLayout>
                            <UserManagement />
                        </AdminLayout>
                    </AuthGuard>
                }
            />

            <Route path="/adminForm" element={
                <LayoutForm>
                    <AdminForm />
                </LayoutForm>
            } />

            <Route path="/formManagement" element={
                <LayoutForm>
                    <FormManagement />
                </LayoutForm>
            } />

            <Route path="/evaluations" element={
                <Layout>
                    <Evaluation />
                </Layout>
            } />
            <Route path="/evaluations/edit/:id" element={
                <Layout>
                    <EditEvaluation />
                </Layout>
            } />

            <Route path="/employeeManagement" element={
                <Layout>
                    <EmployeeManagement />
                </Layout>
            } />


          </Routes>
          
          
    </>
  )
}

export default App
