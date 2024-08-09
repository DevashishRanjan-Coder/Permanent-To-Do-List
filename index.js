import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "permalist_la7y_user",
  host: "dpg-cqquqpogph6c738fpslg-a",
  database: "permalist_la7y",
  password: "tngD0JUdnRpny0f6SfKcbZS5yVDG3XlT",
  port: 5432,
});

db.connect();

db.query(`CREATE TABLE items (
	id SERIAL PRIMARY KEY NOT NULL,
	title VARCHAR(100) NOT NULL,
  list_id SERIAL NOT NULL
);`);


db.query(`CREATE TABLE listType (
	id SERIAL PRIMARY KEY NOT NULL,
	type VARCHAR(20) NOT NULL
);`);

let count = 1;

async function getItems(listID) {
  const itemList = await db.query("SELECT * FROM items WHERE list_id = $1 ORDER BY id ASC;", [listID])
  return itemList.rows;
}

async function getListTitles() {
  const titles = await db.query("SELECT * FROM list_type;")
  return titles.rows;
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {

  const listType = await getListTitles();
  listType.forEach(async (element) => {
    if (element.id === count) {
      const result = await getItems(element.id);
      res.render("index.ejs", {
        listTitle: element.type,
        listItems: result,
      });
    }
  });

});

app.post("/add", async (req, res) => {

  const item = req.body.newItem;
  const listType = await getListTitles();
  listType.forEach(async (element) => {
    if (element.id === count) {
      await db.query("INSERT INTO items (title, list_id) VALUES ($1, $2)", [item, element.id]);
      res.redirect("/");
    }
  });


});

app.post("/edit", async (req, res) => {
  const itemID = req.body.updatedItemId;
  const newContent = req.body.updatedItemTitle;
  const listType = await getListTitles();
  listType.forEach(async (element) => {
    if (element.id === count) {
      await db.query("UPDATE items SET title = $1 WHERE id = $2 AND list_id = $3", [newContent, itemID, element.id]);
      res.redirect("/");
    }
  });
});

app.post("/delete", async (req, res) => {

  const itemId = req.body.deleteItemId;
  const listType = await getListTitles();
  listType.forEach(async (element) => {
    if (element.id === count) {
      await db.query("DELETE FROM items WHERE id = $1 AND list_id = $2", [itemId, element.id]);
      res.redirect("/");
    }
  });

});

app.get("/next", (req, res) => {

  if (count < 3) {
    count++;
    res.redirect("/");
  } else {
    count = 1;
    res.redirect("/");
  }

})

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
