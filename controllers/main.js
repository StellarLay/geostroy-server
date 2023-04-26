//import { validationResult } from 'express-validator';
import queries from '../models/queries.js';
import jwt from 'jsonwebtoken';

// Костылим импорт конфига
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = require('../config/default.json');

export const getObjects = async (req, res) => {
  queries
    .getObjects(req.body)
    .then((response) => {
      if (response.message === 'Invalid Token') {
        res.status(200).json({
          results: response.results,
          error: response.message,
          status: 403,
        });
      } else {
        res.status(200).send({ results: response });
      }
    })

    .catch((error) => {
      res.status(200).json(error);
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
      res.status(200).json(error.message);
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

export const authUser = async (req, res) => {
  queries
    .authUser(req.body)
    .then((response) => {
      res.status(200).send(response);
    })

    .catch((error) => {
      res.status(400).json(error.message);
    });
};

export const resetPass = async (req, res) => {
  queries
    .resetPass(req.body)
    .then((response) => {
      res.status(200).send(response);
    })

    .catch((error) => {
      res.status(400).json(error.message);
    });
};

export const removeObject = async (req, res) => {
  const { id } = req.params;
  queries
    .removeObject(id)
    .then((response) => {
      res.status(200).send(response);
    })

    .catch((error) => {
      res.status(400).json(error.message);
    });
};

export const removeUser = async (req, res) => {
  const { id } = req.params;
  queries
    .removeUser(id)
    .then((response) => {
      res.status(200).send(response);
    })

    .catch((error) => {
      res.status(400).json(error.message);
    });
};

export const getUsers = async (req, res) => {
  queries
    .getUsers(req)
    .then((response) => {
      if (response.message === 'Invalid Token') {
        res.status(200).json({
          results: response.results,
          error: response.message,
          status: 403,
        });
      } else {
        res.status(200).send({ results: response });
      }
    })

    .catch((error) => {
      res.status(400).json(error.message);
    });
};

export const getAccessLevels = async (req, res) => {
  queries
    .getAccessLevels()
    .then((response) => {
      res.status(200).send(response);
    })

    .catch((error) => {
      res.status(400).json(error.message);
    });
};

export const getObjectsOfUser = async (req, res) => {
  const { id } = req.params;

  queries
    .getObjectsOfUser(id)
    .then((response) => {
      res.status(200).send(response);
    })

    .catch((error) => {
      res.status(400).json(error.message);
    });
};

export const updateUser = async (req, res) => {
  queries
    .updateUser(req.body)
    .then((response) => {
      res.status(200).send(response);
    })

    .catch((error) => {
      res.status(400).json(error.message);
    });
};

export const addUser = async (req, res) => {
  queries
    .addUser(req.body)
    .then((response) => {
      res.status(200).send(response);
    })

    .catch((error) => {
      res.status(400).json(error.message);
    });
};

export const updateUsersOfObjects = async (req, res) => {
  const { id } = req.params;

  queries
    .updateUsersOfObjects(req.body, id)
    .then((response) => {
      res.status(200).send(response);
    })

    .catch((error) => {
      res.status(400).json(error.message);
    });
};

export const createPiezometer = async (req, res) => {
  queries
    .createPiezometer(req.body)
    .then((response) => {
      res.status(200).send(response);
    })

    .catch((error) => {
      res.status(400).json(error.message);
    });
};

// Обновление токена
export const createTokens = async (req, res) => {
  const { refresh_token, user_id } = req.body;

  if (!refresh_token) {
    return res.sendStatus(403);
  }

  jwt.verify(refresh_token, config.jwtRefreshSecret, (err, user) => {
    if (err) {
      return res.status(200).json(err);
    }

    const accessToken = jwt.sign({ user_id: user_id }, config.jwtAccessSecret, {
      expiresIn: config.expiresInAccess,
    });

    res.json({
      accessToken,
    });
  });
};
