import fs from 'fs';
let content = fs.readFileSync('src/index.css', 'utf-8');

content = content.replace(
  'body {',
  `body {
    @apply select-none;`
);

content += `
input, textarea {
  @apply select-text;
}
`;

fs.writeFileSync('src/index.css', content);
