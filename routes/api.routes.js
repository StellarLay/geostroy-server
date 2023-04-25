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
  removeObject,
  getUsers,
  removeUser,
  getAccessLevels,
  getObjectsOfUser,
  updateUser,
  addUser,
  updateUsersOfObjects,
} from '../controllers/main.js';

// * Получаем отправленный bearer и оставляем от него только токен
const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers.authorization;

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.access_token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
  }
};

const router = Router();

router.post('/getObjects', verifyToken, getObjects);
router.get('/getPiezometers/:id', getPiezometers);
router.get('/getSensors/:id', getSensors);
router.get('/getObjectsPiezoSensors/:id', getObjectsPiezoSensors);
router.put('/unbindSensor/:id', unBindSensor);
router.get('/getUnbindSensors', getUnbindSensors);
router.put('/addSensorToPiezo/:piezo_id/:sensor_id', addSensorToPiezo);
router.get('/getSensorName/:id', getSensorName);
router.post('/addSensorData', addSensorData);
router.delete('/removeObject/:id', removeObject);
router.delete('/removeUser/:id', removeUser);
router.get('/getUsers', verifyToken, getUsers);
router.get('/getAccess', getAccessLevels);
router.get('/getObjectsOfUser/:id', getObjectsOfUser);
router.post('/updateUser', updateUser);
router.post('/addUser', addUser);
router.post('/updateUsersOfObjects/:id', updateUsersOfObjects);

export default router;
