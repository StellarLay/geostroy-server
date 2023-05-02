import queries from '../models/queries_data.js';

export const addData = async (req, res) => {
  queries
    .addData(req.query.data)
    .then((response) => {
      res.status(200).send(response);
    })

    .catch((error) => {
      res.status(400).send(error.message);
    });
};
