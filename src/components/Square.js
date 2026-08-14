function Square({ value, winning, selected, destination, disabled, onClick }) {
  const classes = ['square', value ? `mark-${value.toLowerCase()}` : '', winning ? 'winning' : '', selected ? 'selected-square' : '', destination ? 'move-destination' : ''].filter(Boolean).join(' ');
  return <button className={classes} role="gridcell" disabled={disabled} aria-label={value ? `Cell ${value}` : 'Empty cell'} onClick={onClick}>{value}</button>;
}

export default Square;
