import 'bootstrap/dist/css/bootstrap.min.css';
import './notFound.scss';

const NotFound = () => {
    return (
        <div className="not-found-wrapper d-flex justify-content-center align-items-center">
            <div className="not-found-content">
                <h1 className="error-code">404</h1>

                <div className="divider"></div>

                <h2 className="error-status">Resource Not Found</h2>

                <p className="error-message">
                    The requested resource is unavailable.
                    The path may not exist, may have been moved, or access may be restricted.
                </p>
            </div>
        </div>
    );
};

export default NotFound;