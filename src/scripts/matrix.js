const canvas = document.getElementById('matrix');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const glyphs = '01アカサタナハマヤラワ'.split('');
  let columns = [];

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colCount = Math.floor(canvas.width / 16);
    columns = Array(colCount).fill(1);
  };

  const draw = () => {
    ctx.fillStyle = 'rgba(10,10,12,0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff41';
    ctx.font = '14px Fira Code';

    columns.forEach((y, x) => {
      const text = glyphs[Math.floor(Math.random() * glyphs.length)];
      ctx.fillText(text, x * 16, y * 16);
      columns[x] = y * 16 > canvas.height && Math.random() > 0.98 ? 0 : y + 1;
    });
  };

  resize();
  setInterval(draw, 70);
  window.addEventListener('resize', resize);
}
