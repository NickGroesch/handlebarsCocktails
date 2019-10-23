const express = require('express');
const exphbs = require('express-handlebars');
const axios = require('axios')

const app = express();

let PORT = process.env.PORT || 8080;

app.engine('handlebars', exphbs({ defaultLayout: "main" }));
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
    res.render('home');
});
app.get('/search', function (req, res) {
    console.log(req.url)
    let ingredient = req.query.ingredient
    axios.get(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${ingredient}`).then(data => {
        let drinkIds = []
        data.data.drinks.forEach(drink => drinkIds.push(drink.idDrink))
        let drinkDeets = []
        drinkIds.forEach((value, index) => {
            axios.get(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${value}`).then(data => {
                const datum = data.data.drinks[0]
                const deets = {
                    name: datum.strDrink,
                    instructions: datum.strInstructions,
                    pic: datum.strDrinkThumb,
                    gredients: []
                }
                for (let num = 1; num <= 15; num++) {
                    if (datum[`strIngredient${num}`]) {
                        deets.gredients.push({ name: datum[`strIngredient${num}`], amount: datum[`strMeasure${num}`] })
                    }
                }
                drinkDeets.push(deets)
            })
        })
        setTimeout(() => {

            var rend = { search: `${ingredient}`, drinkIds: drinkIds, drinkDeets: drinkDeets }
            res.render('results', rend);
        }, 3000)
    })
});

app.listen(PORT, () => console.log(`App listening on port:${PORT}`));