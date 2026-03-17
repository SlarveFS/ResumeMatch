import { getScoreEmoji, getScoreColor, getNextHint } from '../../utils/wizardScore';

export default function ScoreBar({ score, data }) {
  const emoji = getScoreEmoji(score);
  const color = getScoreColor(score);
  const hint = getNextHint(data);

  return (
    <div className="score-bar-wrap">
      <div className="score-bar-inner">
        <span className="score-bar-emoji">{emoji}</span>

        <div className="score-bar-track-wrap">
          <div className="score-bar-track">
            <div
              className="score-bar-fill"
              style={{ width: `${score}%`, background: color }}
            />
          </div>
        </div>

        <span className="score-bar-pct" style={{ color }}>
          {score}%
        </span>

        {hint && (
          <span className="score-bar-hint">
            +{hint.pts}% {hint.text}
          </span>
        )}
      </div>
    </div>
  );
}
