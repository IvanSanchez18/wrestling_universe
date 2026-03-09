import { Link } from "react-router-dom";

const HomeCard = ({ title, image, to, focusX, focusY, className = "" }) => (
  <Link to={to}>
    <div
      className={`home-card ${className}`}
      style={{
        "--bg": `url(${image})`,
        "--focus-x": focusX,
        "--focus-y": focusY
      }}
    >
      <h2 className="home-card__title">{title}</h2>
    </div>
  </Link>
);

export default HomeCard;