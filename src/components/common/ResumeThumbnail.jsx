import { useRef, useEffect, useState } from 'react';
import LivePreview from '../builder/LivePreview';
import './TemplateThumbnail.css';

const PAPER_WIDTH = 680;

export default function ResumeThumbnail({ resumeData }) {
  const outerRef = useRef(null);
  const [scale, setScale] = useState(0.28);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      if (w > 10) setScale(w / PAPER_WIDTH);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outerRef} className="tt-outer">
      <div
        className="tt-inner"
        style={{ transform: `scale(${scale})`, width: PAPER_WIDTH }}
      >
        <LivePreview resumeData={resumeData} paperRef={null} />
      </div>
    </div>
  );
}
