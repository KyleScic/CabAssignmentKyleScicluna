import express from 'express';

import * as locationController from "../controllers/location.controller.js";
import {getLocationWeatherById} from "../controllers/location.controller.js";

const router = express.Router();


router.post('/', locationController.addLocation);


router.get('/', locationController.getLocations);

router.get('/:id', locationController.getLocationById);

router.get('/weather/:id', locationController.getLocationWeatherById);


router.put('/:id', locationController.updateLocation);


router.delete('/:id', locationController.removeLocation);

export default router;