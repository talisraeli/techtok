import { useNavigate } from 'react-router-dom';
import { courses } from '../../data/courses';
import './Home.css';

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-title">TechTok</h1>
        <p className="home-subtitle">ללמוד כמו בטיקטוק</p>
      </header>
      
      <main className="courses-grid">
        {courses.map(course => (
          <div 
            key={course.id} 
            className="course-card"
            onClick={() => navigate(`/course/${course.id}`)}
          >
            <div className="course-card__content">
              <h2 className="course-card__title">{course.title}</h2>
              <p className="course-card__description">{course.description}</p>
              <div className="course-card__footer">
                <img 
                  src={course.instructorImage} 
                  alt={course.instructor} 
                  className="course-card__avatar"
                />
                <span className="course-card__instructor">מרצה: {course.instructor}</span>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
