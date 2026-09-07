const { chromium } = require('playwright');

const MODES = [
  'Quiz Classique',
  'Rapid Fire',
  'Vrai ou Faux',
  'Bataille d\'équipes',
  'Agorax'
];

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  
  for (const mode of MODES) {
    console.log(`\n\n--- TESTING MODE: ${mode} ---`);
    const contextHost = await browser.newContext({ locale: 'fr-FR' });
    const contextPlayer1 = await browser.newContext({ locale: 'fr-FR' });
    const contextPlayer2 = await browser.newContext({ locale: 'fr-FR' });

    const pageHost = await contextHost.newPage();
    const pagePlayer1 = await contextPlayer1.newPage();
    const pagePlayer2 = await contextPlayer2.newPage();

    try {
      console.log("Host creating room...");
      await pageHost.goto('http://localhost:3000/play/online');
      await pageHost.waitForSelector('input[placeholder="Ex : Alex"]', { timeout: 10000 });
      await pageHost.fill('input[placeholder="Ex : Alex"]', 'HostBot');
      await pageHost.click('button:has-text("Créer un salon")');
      
      // Options screen
      await pageHost.waitForSelector(`text=${mode}`, { timeout: 5000 });
      await pageHost.click(`text=${mode}`);
      await new Promise(r => setTimeout(r, 1000));
      await pageHost.click('button:has-text("Créer et ouvrir le salon")');
      
      const roomCodeElement = await pageHost.waitForSelector('.tracking-\\[0\\.25em\\]', { timeout: 10000 });
      const roomCode = await roomCodeElement.innerText();
      console.log(`Room created: ${roomCode}`);

      // Players joining
      for (const [i, p] of [[1, pagePlayer1], [2, pagePlayer2]]) {
        await p.goto(`http://localhost:3000/play/online?room=${roomCode.replace(/\s/g, '')}`);
        await p.waitForSelector('input[placeholder="Ex : Alex"]', { timeout: 10000 });
        await p.fill('input[placeholder="Ex : Alex"]', `Bot${i}`);
        await p.click('button:has-text("Rejoindre")');
        await p.waitForSelector('text=En ligne', { timeout: 10000 });
        console.log(`Player ${i} joined.`);
      }

      console.log("Host starting game...");
      await pageHost.click('button:has-text("Lancer la partie")');

      // Wait for game to be in playing state
      // We look for either "Question" or buzzer button or some playing indicator
      await new Promise(r => setTimeout(r, 4000));
      
      console.log("Checking if game is active...");
      const hostText = await pageHost.locator('body').innerText();
      if (hostText.includes('Erreur') || hostText.includes('Aucune question disponible')) {
        console.error(`Mode ${mode} failed to start. Body: ${hostText.substring(0, 300)}`);
        continue;
      }
      
      console.log(`Mode ${mode} started successfully!`);
    } catch (e) {
      console.error(`Error in mode ${mode}:`, e.message);
    } finally {
      await contextHost.close();
      await contextPlayer1.close();
      await contextPlayer2.close();
    }
  }

  await browser.close();
  console.log("\nAll tests completed.");
}

runTests();
