const bcrypt = require('bcrypt');

async function main() {
    const hash = await bcrypt.hash('RwaSec#2026!Admin', 10);
    const match = await bcrypt.compare('RwaSec#2026!Admin', hash);
    console.log('Match?', match);
}

main();
