function Header({ theme, onThemeToggle }) {
  return <header className="site-header"><a className="brand" href="/Tic-Tac-Toe-React-Material-UI/" aria-label="Tic-Tac-Toe home"><span>✦</span> TTT</a><nav><a href="https://github.com/amirrezapanahi/Tic-Tac-Toe-React-Material-UI" target="_blank" rel="noreferrer">Source</a><button className="theme-toggle" onClick={onThemeToggle} aria-label="Toggle color theme">{theme === 'dark' ? '☀ Light' : '☾ Dark'}</button></nav></header>;
}
export default Header;
