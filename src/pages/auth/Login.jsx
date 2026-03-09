import { useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { UserSettings } from "../../services/apiService";
import i18n from "i18next";
import { Link, useNavigate } from "react-router-dom";
import "./register.scss";

const Login = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setErrorMsg(error.message);
            return;
        }

        const settings = await UserSettings.get();

        if (settings?.language) {
            localStorage.setItem("i18nextLng", settings.language);
            await i18n.changeLanguage(settings.language);
        }

        navigate("/");
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <form className="register-form" onSubmit={handleLogin}>
                    <h2>Log In</h2>

                    {errorMsg && <p className="error">{errorMsg}</p>}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group password-group">
                        <label htmlFor="password">Password</label>

                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <i
                                    className={
                                        showPassword
                                            ? "fa-solid fa-eye"
                                            : "fa-solid fa-eye-slash"
                                    }
                                />
                            </button>
                        </div>
                    </div>

                    <button type="submit">Log In</button>

                    <p className="register-link">
                        Don't have an account? <Link to="/register">Create one here</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;