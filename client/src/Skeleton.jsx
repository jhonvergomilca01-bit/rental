export const SkeletonGrid = ({ n = 6 }) => (
  <div className="grid">
    {Array.from({ length: n }, (_, i) => (
      <div className="card skel" key={i}><div className="s-pic" /><div className="s-line" /><div className="s-line short" /></div>
    ))}
  </div>
);