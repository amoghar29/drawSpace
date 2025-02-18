import { Router } from "express";
import roomController from "../controllers/create-room";
import { authMiddleware } from "../middlewares/authMiddleware";

const router: Router = Router();

router.post('/create-room',authMiddleware, roomController);

module.exports = router;