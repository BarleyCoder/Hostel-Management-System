import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
      const navigate = useNavigate();
      const [user, setUser] = useState(null);
      const [error, setError] = useState("");
      const [loading, setLoading] = useState(true);

      useEffect(() => {
            let isMounted = true;

            const loadUser = async () => {
                  if (!localStorage.getItem("token")) {
                        navigate("/login", { replace: true });
                        return;
                  }

                  try {
                        const response = await api.get("/auth/me");
                        if (isMounted) setUser(response.data.user);
                  } catch (requestError) {
                        if (!isMounted) return;

                        if (requestError.response?.status === 401) {
                              localStorage.removeItem("token");
                              localStorage.removeItem("user");
                              navigate("/login", { replace: true });
                        } else {
                              setError(
                                    requestError.response?.data?.message ||
                                    "Unable to load your dashboard. Please try again."
                              );
                        }
                  } finally {
                        if (isMounted) setLoading(false);
                  }
            };

            loadUser();
            return () => {
                  isMounted = false;
            };
      }, [navigate]);

      const handleLogout = () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login", { replace: true });
      };

      return (
            <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
                  <section className="mx-auto max-w-5xl">
                        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
                              <div>
                                    <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                                          Hostel Accommodation Portal
                                    </p>
                                    <h1 className="mt-2 text-2xl font-bold text-slate-900">
                                          Dashboard
                                    </h1>
                              </div>
                              <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                              >
                                    Log out
                              </button>
                        </header>

                        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                              {loading ? (
                                    <p role="status" className="text-slate-600">Loading your account…</p>
                              ) : error ? (
                                    <div role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
                                          <p>{error}</p>
                                          <button
                                                type="button"
                                                onClick={() => window.location.reload()}
                                                className="mt-3 font-semibold underline"
                                          >
                                                Try again
                                          </button>
                                    </div>
                              ) : user ? (
                                    <>
                                          <h2 className="text-xl font-semibold text-slate-900">
                                                Welcome, {user.fullName}
                                          </h2>
                                          <p className="mt-2 text-slate-600">
                                                Signed in as {user.role}. Your accommodation dashboard is ready.
                                          </p>
                                    </>
                              ) : null}
                        </div>
                  </section>
            </main>
      );
}

export default Dashboard;
