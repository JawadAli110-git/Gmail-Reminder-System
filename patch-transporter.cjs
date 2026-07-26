const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Find transporter init
const transporterInitStr = `const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});`;

if (content.includes(transporterInitStr)) {
  content = content.replace(transporterInitStr, '');
  content = content.replace('const app = express();', 'const app = express();\n' + transporterInitStr);
  fs.writeFileSync('server.ts', content);
}
