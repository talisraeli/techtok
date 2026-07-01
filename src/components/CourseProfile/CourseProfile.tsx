import { useParams, useNavigate } from 'react-router-dom';
import { courses } from '../../data/courses';
import { clips } from '../../data/clips';
import { useWatchHistory } from '../../hooks/useWatchHistory';
import './CourseProfile.css';

export function CourseProfile() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { getProgress } = useWatchHistory();

  const course = courses.find(c => c.id === courseId);
  const courseClips = clips.filter(c => c.courseId === courseId);

  if (!course) {
    return <div className="course-profile--not-found">קורס לא נמצא</div>;
  }

  const handleClipClick = (clipId: string) => {
    navigate(`/watch/${courseId}?startClip=${clipId}`);
  };

  return (
    <div className="course-profile-container">
      {/* Header section with back button */}
      <header className="course-profile-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
        <span className="course-profile-header__title">{course.title}</span>
      </header>

      {/* Profile info section */}
      <div className="course-profile-info">
        <img
          src={course.instructorImage}
          alt={course.instructor}
          className="course-profile-info__image"
        />
        <h1 className="course-profile-info__name">{course.instructor}</h1>
        <p className="course-profile-info__desc">{course.description}</p>
        <div className="course-profile-info__stats">
          <div className="stat-item">
            <strong>{courseClips.length}</strong>
            <span>סרטונים</span>
          </div>
        </div>
      </div>

      {/* Clips grid */}
      <div className="course-profile-clips">
        {courseClips.map((clip) => {
          const progress = getProgress(clip.id);
          const isWatched = progress > 0.9;
          const isStarted = progress > 0 && progress <= 0.9;

          return (
            <div
              key={clip.id}
              className={`profile-clip-card ${isWatched ? 'watched' : ''}`}
              onClick={() => handleClipClick(clip.id)}
            >
              <div className="profile-clip-card__thumbnail">
                <img
                  src={`https://img.youtube.com/vi/${clip.videoId}/hqdefault.jpg`}
                  alt={clip.title}
                />
                <div className="profile-clip-card__overlay">
                  <span className="play-icon">▶</span>
                </div>
                {isStarted && (
                  <div className="progress-bar-mini">
                    <div
                      className="progress-bar-mini__fill"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                )}
                {isWatched && (
                  <div className="watched-badge">✓ נצפה</div>
                )}
              </div>
              <div className="profile-clip-card__info">
                <h3 className="profile-clip-card__title">{clip.title}</h3>
                <span className="profile-clip-card__lecture">
                  {clip.lectureName} {clip.totalParts > 1 ? `(${clip.part}/${clip.totalParts})` : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
