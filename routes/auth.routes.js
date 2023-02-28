import { Router } from 'express';
import {
  getObjects,
  getPiezometers,
  getSensors,
  unBindSensor,
  getObjectsPiezoSensors,
  getUnbindSensors,
  addSensorToPiezo,
  getSensorName,
  addSensorData,
} from '../controllers/main.js';

const router = Router();

router.get('/getObjects', getObjects);
router.get('/getPiezometers/:id', getPiezometers);
router.get('/getSensors/:id', getSensors);
router.get('/getObjectsPiezoSensors/:id', getObjectsPiezoSensors);
router.put('/unbindSensor/:id', unBindSensor);
router.get('/getUnbindSensors', getUnbindSensors);
router.put('/addSensorToPiezo/:piezo_id/:sensor_id', addSensorToPiezo);
router.get('/getSensorName/:id', getSensorName);
router.post('/addSensorData', addSensorData);

export default router;
