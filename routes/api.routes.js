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
  changeSensorData,
  removeObject,
  getUsers,
  removeUser,
  getAccessLevels,
  getObjectsOfUser,
  updateUser,
  addUser,
  updateUsersOfObjects,
  createPiezometer,
  removePiezo,
  removeSensor,
  getPermissions,
  getPiezometersForClients,
  addPermission,
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
//router.post('/getPiezometers', getPiezometers);
router.post('/getPiezometersForClients', getPiezometersForClients);
router.get('/getSensors/:id', getSensors);
router.get('/getObjectsPiezoSensors/:id', getObjectsPiezoSensors);
router.put('/unbindSensor/:id', unBindSensor);
router.get('/getUnbindSensors', getUnbindSensors);
router.put('/addSensorToPiezo/:piezo_id/:sensor_id', addSensorToPiezo);
router.get('/getSensorName/:id', getSensorName);
router.post('/addSensorData', addSensorData);
router.post('/changeSensorData', changeSensorData);
router.delete('/removeObject/:id', removeObject);
router.delete('/removePiezo/:id', removePiezo);
router.delete('/removeUser/:id', removeUser);
router.delete('/removeSensor/:id', removeSensor);
router.get('/getUsers', verifyToken, getUsers);
router.get('/getAccess', getAccessLevels);
router.get('/getObjectsOfUser/:id', getObjectsOfUser);
router.post('/updateUser', updateUser);
router.post('/addUser', addUser);
router.post('/createPiezometer', createPiezometer);
router.post('/addPermission', addPermission);
router.post('/updateUsersOfObjects/:id', updateUsersOfObjects);
router.get('/getPermissions', getPermissions);

export default router;
