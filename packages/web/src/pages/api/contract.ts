import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import {json} from "starknet";

const handler = nc<NextApiRequest, NextApiResponse>({
  onError: (err, req, res) => {
    res.status(500).send({ message: "internal server error" });
  },
}).get((_, res) => {
  const fs = require('fs');
  const path = require('path');

  const file = fs.readFileSync("./src/pages/api/Multisig.json");
  const contract = json.parse(file.toString("ascii"));

  res.send({ contract: file.toString("ascii") });
});

export default handler;
