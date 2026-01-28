import { useNavigate } from "react-router-dom";
import "../../styles/MediaLandingSection.css";

function MediaLandingSection() {
  const navigate = useNavigate();

  return (
    <section
      className="media-landing"
      onClick={() => navigate("/media")}
      role="button"
    >
      {/* LEFT IMAGE */}
      <div className="media-landing-image">
        <img 
        src="/images/media-landing.png" 
        alt="Books and media library" />
      </div>

      {/* RIGHT CONTENT */}
      <div className="media-landing-content">
        <h2>Books & Media</h2>
        <p>
          Access maritime books, technical documents, and digital media curated
          for professionals. Learn, explore, and stay informed.
        </p>

        <span className="media-landing-link">
          Browse Library →
        </span>
      </div>
    </section>
  );
}

export default MediaLandingSection;
