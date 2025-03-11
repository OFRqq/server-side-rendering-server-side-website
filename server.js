// Importeer het npm package Express (uit de door npm aangemaakte node_modules map)
// Deze package is geïnstalleerd via `npm install`, en staat als 'dependency' in package.json
import express from "express";

// Importeer de Liquid package (ook als dependency via npm geïnstalleerd)
import { Liquid } from "liquidjs";

// Doe een fetch naar de data die je nodig hebt
// const apiResponse = await fetch('...')

// Lees van de response van die fetch het JSON object in, waar we iets mee kunnen doen
// const apiResponseJSON = await apiResponse.json()

// Controleer eventueel de data in je console
// (Let op: dit is _niet_ de console van je browser, maar van NodeJS, in je terminal)
// console.log(apiResponseJSON)

// Maak een nieuwe Express applicatie aan, waarin we de server configureren
const app = express();

// Gebruik de map 'public' voor statische bestanden (resources zoals CSS, JavaScript, afbeeldingen en fonts)
// Bestanden in deze map kunnen dus door de browser gebruikt worden
app.use(express.static("public"));

// Stel Liquid in als 'view engine'
const engine = new Liquid();
app.engine("liquid", engine.express());

// Stel de map met Liquid templates in
// Let op: de browser kan deze bestanden niet rechtstreeks laden (zoals voorheen met HTML bestanden)
app.set("views", "./views");

const storyResponse = await fetch(
  `https://fdnd-agency.directus.app/items/tm_story`
);
const { data: storyResponseJSON } = await storyResponse.json();

const audioResponse = await fetch(
  `https://fdnd-agency.directus.app/items/tm_audio`
);
const { data: audioResponseJSON } = await audioResponse.json();

const audioData = await fetch(
  `https://fdnd-agency.directus.app/items/tm_story?sort=season&fields=audio.audio_file`
);
const { data: audioDataRes } = await audioData.json();
let customStory = [];
// Maak een GET route voor de index (meestal doe je dit in de root, als /)
app.get("/", async function (request, response) {
  // Combineer de data correct
  customStory = storyResponseJSON.map((obj, i) => {
    return {
      ...obj,
      audioFile: audioDataRes[i].audio.flatMap((item) => item.audio_file) || [],
    };
  });

  console.log(customStory);

  // Render de pagina met de correcte data
  response.render("index.liquid", {
    story: storyResponseJSON,
    audioJSON: audioResponseJSON,
    customStory
  });
});

app.get("/story", async function (request, response) {
  // Render index.liquid uit de Views map
  // Geef hier eventueel data aan mee
  response.render("detail.liquid");
});

// Maak een POST route voor de index; hiermee kun je bijvoorbeeld formulieren afvangen
// Hier doen we nu nog niets mee, maar je kunt er mee spelen als je wilt
app.post("/", async function (request, response) {
  // Je zou hier data kunnen opslaan, of veranderen, of wat je maar wilt
  // Er is nog geen afhandeling van een POST, dus stuur de bezoeker terug naar /
  response.redirect(303, "/");
});

// Stel het poortnummer in waar Express op moet gaan luisteren
// Lokaal is dit poort 8000, als dit ergens gehost wordt, is het waarschijnlijk poort 80
app.set("port", process.env.PORT || 8000);

// Start Express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get("port"), function () {
  // Toon een bericht in de console en geef het poortnummer door
  console.log(`Application started on http://localhost:${app.get("port")}`);
});
