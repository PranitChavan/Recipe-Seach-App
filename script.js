'use strict';

const form = document.querySelector('.search');
const searchInput = document.querySelector('.search__input');
const searchIcon = document.querySelector('.search__icon');
const favMeals = document.querySelector('.fav__meals');
const meals = document.querySelector('.meals');
const modal = document.querySelector('.modal');

let favMealsArr = [];
getFavMealsFromLocalStorage();
addFavMeals(favMealsArr);
let apiData;

async function getData(url, type) {
  try {
    const res = await fetch(url);
    apiData = await res.json();

    if (!apiData.meals) throw new Error('Meals Not Found.');

    if (type === 'random') {
      displayMeals(apiData.meals, true);
    }

    if (type === 'all') {
      displayMeals(apiData.meals);
    }
  } catch (err) {
    console.error(err);
  }
}

function displayMeals(data, random = false) {
  if (!random) document.querySelector('.meal').style.display = 'none';

  data.forEach((m) => {
    const html = `
    <div class="meal" data-unq = "${m.idMeal}" >
    <div class="meal__header" >
    ${
      random
        ? `
  <span class="random"> Random Recipe </span>`
        : ''
    }
      <img src="${m.strMealThumb}" alt="" class="meal__img" />
    </div>
    <div class="meal__body">
      <h4 class="meal__name">${m.strMeal}</h4>
      <button class="like-btn" ">
        <i class="fas fa-heart fa-2x" id = "${m.idMeal}"></i>
      </button>
    </div>
    </div> `;

    meals.insertAdjacentHTML('afterbegin', html);
  });

  const meal = Array.from(document.querySelectorAll('.meal'));
  displayAllDetails(meal);

  //////////  ADDING AND REMOVING MEALS TO FAV CONTAINER WHEN LIKE BUTTON IS CLICKED

  const btn = Array.from(document.getElementsByClassName('like-btn'));

  btn.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if (btn.classList.contains('active')) {
        btn.classList.remove('active');

        favMealsArr = favMealsArr.filter((meal) => {
          return meal.idMeal !== e.target.id;
        });

        localStorage.setItem('fav', JSON.stringify(favMealsArr));

        addFavMeals(favMealsArr);
      } else {
        btn.classList.add('active');

        const index = data.findIndex((m) => {
          return m.idMeal === e.target.id;
        });

        favMealsArr.push(data[index]);
        addFavMeals(favMealsArr);

        addFavMealsToLocalStorage();
      }
    });
  });
}

getData('https://www.themealdb.com/api/json/v1/1/random.php', 'random');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  getData(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchInput.value}`,
    'all'
  );
});

function addFavMeals(data) {
  favMeals.innerHTML = '';
  data.forEach((m) => {
    const html = `<li data-unq = "${m.idMeal}">
  <img
    src="${m.strMealThumb}"
    alt=""
    class="fav__meals-img"
  />
  <span class="fav__meals-name">${m.strMeal.slice(0, 6)}...</span>
    <button class="clear">
    <i class="fas fa-window-close"  id ="${m.idMeal}"></i>
    </button>
 
  </button>
  </li>`;

    favMeals.insertAdjacentHTML('afterbegin', html);
  });

  const li = Array.from(favMeals.querySelectorAll('li'));

  displayAllDetails(li);

  //////// REMOVING MEALS WHEN CANCEL ICON IS PRESSED
  const delFavMeals = Array.from(document.querySelectorAll('.fa-window-close'));

  delFavMeals.forEach((del) => {
    del.addEventListener('click', (e) => {
      favMealsArr = favMealsArr.filter((m) => {
        return m.idMeal !== e.target.id;
      });

      localStorage.setItem('fav', JSON.stringify(favMealsArr));

      addFavMeals(favMealsArr);
    });
  });
}

// DISPLAY MODAL CONTAITNING ALL DETAILS OF RECEpi

function displayAllDetails(loc) {
  loc.forEach((meal) => {
    meal.addEventListener('click', (e) => {
      if (
        e.target.classList.contains('fa-heart') ||
        e.target.classList.contains('fa-window-close')
      )
        return;

      modal.classList.remove('hidden');

      const clickedRecipe = apiData.meals.filter((m) => {
        return m.idMeal === e.target.closest('[data-unq]').dataset.unq;
      });

      const [data] = clickedRecipe;

      const ing = [];

      for (let i = 1; i <= 20; i++) {
        if (data[`strIngredient${i}`] && data[`strMeasure${i}`] !== '') {
          ing.push(
            data[`strIngredient${i}`] + ' ' + '-' + ' ' + data[`strMeasure${i}`]
          );
        } else {
          break;
        }
      }

      const html = `<div class="modal__popup">
        <div class="modal__header">
          <h1>${data.strMeal}</h1>
          <i class="fas fa-times-circle fa-2x"></i>
        </div>

        <div class="modal__poster">
          <img src="${data.strMealThumb}" class="modal__img" />
        </div>

        <div class="modal__receipi">
         ${data.strInstructions}
        </div>

        <h3>Ingredients:</h3>
 
        <ul class="modal__ingredients">
            ${ing
              .map((i) => {
                return `<li> ${i} </li>`;
              })
              .join('')}
        </ul>
      </div>`;

      modal.insertAdjacentHTML('afterbegin', html);

      //// FOR CLOSING MODAL

      const closeModal = document.querySelector('.fa-times-circle');

      closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.innerHTML = '';
      });

      if (!modal.classList.contains('hidden')) {
        modal.addEventListener('click', (e) => {
          if (e.target.closest('.modal__popup')) {
            return;
          }
          modal.classList.add('hidden');
          modal.innerHTML = '';
        });
      }
    });
  });
}

function addFavMealsToLocalStorage() {
  localStorage.setItem('fav', JSON.stringify(favMealsArr));
}

function getFavMealsFromLocalStorage() {
  const items = JSON.parse(localStorage.getItem('fav'));
  if (!items) return;
  items.forEach((i) => {
    favMealsArr.push(i);
  });
}
