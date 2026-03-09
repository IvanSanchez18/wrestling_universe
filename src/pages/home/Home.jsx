import { useTranslation } from "react-i18next";
import HomeCard from "../../components/home/HomeCard";
import '../../styles/theme.scss';
import "./home.scss";

const Home = () => {
  const { t } = useTranslation("home");

  return (
    <div className="home">
      <div className="home__left">
        <HomeCard
          title={t("universe")}
          image="/images/universe.jpg"
          to="/universe"
          focusX="50%"
          focusY="20%"
          className="focus-universe"
        />
      </div>
      <div className="home__right">
        <HomeCard
          title={t("options")}
          image="/images/options.jpg"
          to="/options"
          focusX="60%"
          focusY="1%"
          className="focus-options"
        />
        <HomeCard
          title={t("jukebox")}
          image="/images/jukebox.jpg"
          to="/jukebox"
          focusX="50%"
          focusY="10%"
          className="focus-jukebox"
        />
      </div>
    </div>
  );
};

export default Home;