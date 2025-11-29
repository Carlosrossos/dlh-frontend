import './POISkeleton.css';

interface POISkeletonProps {
  count?: number;
}

function POISkeleton({ count = 3 }: POISkeletonProps) {
  return (
    <div className="poi-skeleton-list">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="poi-skeleton-card">
          <div className="skeleton-image"></div>
          <div className="skeleton-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-text short"></div>
            <div className="skeleton-footer">
              <div className="skeleton-badge"></div>
              <div className="skeleton-badge"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default POISkeleton;
