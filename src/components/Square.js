function Square({ value, winning, disabled, onClick }) {
  return <button className={`square ${value ? `mark-${value.toLowerCase()}` : ''} ${winning ? 'winning' : ''}`} role="gridcell" disabled={disabled} aria-label={value ? `Cell ${value}` : 'Empty cell'} onClick={onClick}>{value}</button>;
}
export default Square;
