const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller');
const authenticationController = require('../controllers/authentication.controller');

// Hier werk je de routes uit.
// UC-301 Toevoegen van nieuwe maaltijden
router.post('', authenticationController.validateToken, mealController.createMeal);

// UC-302 Wijzigen van maaltijd
router.put('/:mealId', authenticationController.validateToken, mealController.updateMeal);

// UC-303 Opvragen van alle maaltijden
router.get('', mealController.getAllMeals);

// UC-304 Opvragen van maaltijd bij ID
router.get('/:mealId', mealController.getMealById);

// UC-305 Verwijderen van maaltijd
router.delete('/:mealId', authenticationController.validateToken, mealController.deleteMeal);

module.exports = router;
