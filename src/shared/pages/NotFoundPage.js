import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div>
      <p>Page not found.</p>
      <Link to="/">Go to patient login</Link>
    </div>
  );
}

export default NotFoundPage;

