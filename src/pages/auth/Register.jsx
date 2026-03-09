import { useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { Link } from "react-router-dom";
import "./register.scss";

function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const formData = Object.fromEntries(new FormData(e.target));
        const { email, password, confirm_password, name, alias } = formData;

        if (!email || !password || !confirm_password) {
            setError("All fields are required");
            return;
        }

        if (password.length < 6) {
            setError("The password must be at least 6 characters long");
            return;
        }

        if (password !== confirm_password) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    alias,
                },
            },
        });

        await supabase.auth.signOut();

        setLoading(false);

        if (error) {
            setError(error.message);
            return;
        }

        setSuccess("Successful registration. Check your email to confirm your account.");
        e.target.reset();
    };

    return (
        <section className="register-container">
            <div className="register-card">
                <h2>User Registration</h2>

                <form className="register-form" onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" />
                    </div>

                    <div className="form-group password-group">
                        <label>Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <i
                                    className={`fa-solid ${showPassword ? "fa-eye" : "fa-eye-slash"
                                        }`}
                                ></i>
                            </button>
                        </div>
                    </div>

                    <div className="form-group password-group">
                        <label>Confirm Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showConfirm ? "text" : "password"}
                                name="confirm_password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                            >
                                <i
                                    className={`fa-solid ${showConfirm ? "fa-eye" : "fa-eye-slash"
                                        }`}
                                ></i>
                            </button>
                        </div>
                    </div>

                    {error && <p className="error">{error}</p>}
                    {success && <p className="success">{success}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? "Registering..." : "Register"}
                    </button>

                    <p className="register-link">
                        Already have an account? <Link to="/login">Log in</Link>
                    </p>
                </form>
            </div>
        </section>
    );
}

export default Register;