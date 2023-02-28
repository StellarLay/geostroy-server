//import { validationResult } from 'express-validator';
import queries from '../models/queries.js';

export const getObjects = async (req, res) => {
  queries
    .getObjects()
    .then((response) => {
      res.status(200).send(response);
    })

    .catch((error) => {
      res.status(400).send(error.message);
    });
};

export const getPiezometers = async (req, res) => {
  const { id } = req.params;
  queries
    .getPiezometers(id)
    .then((response) => {
      res.status(200).send(response);
    })

    .catch((error) => {
      res.status(400).send(error.message);
    });
};

export const getSensors = async (req, res) => {
  const { id } = req.params;
  queries
    .getSensors(id)
    .then((response) => {
      res.status(200).send(response);
    })

    .catch((error) => {
      res.status(400).send(error.message);
    });
};

export const getObjectsPiezoSensors = async (req, res) => {
  const { id } = req.params;
  queries
    .getObjectsPiezoSensors(id)
    .then((response) => {
      res.status(200).send(response);
    })

    .catch((error) => {
      res.status(400).send(error.message);
    });
};

export const unBindSensor = async (req, res) => {
  const { id } = req.params;
  queries
    .unBindSensor(id)
    .then((response) => {
      res.status(200).send(response);
    })

    .catch((error) => {
      res.status(400).send(error.message);
    });
};

export const getUnbindSensors = async (req, res) => {
  queries
    .getUnbindSensors()
    .then((response) => {
      res.status(200).send(response);
    })

    .catch((error) => {
      res.status(400).send(error.message);
    });
};

export const addSensorToPiezo = async (req, res) => {
  const { piezo_id, sensor_id } = req.params;
  queries
    .addSensorToPiezo(piezo_id, sensor_id)
    .then((response) => {
      res.status(200).send(response);
    })

    .catch((error) => {
      res.status(400).send(error.message);
    });
};

export const getSensorName = async (req, res) => {
  const { id } = req.params;
  queries
    .getSensorName(id)
    .then((response) => {
      res.status(200).send(response);
    })

    .catch((error) => {
      res.status(400).send(error.message);
    });
};

export const addSensorData = async (req, res) => {
  queries
    .addSensorData(req.body)
    .then((response) => {
      res.status(200).send(response);
    })

    .catch((error) => {
      res.status(400).send(error.message);
    });
};
