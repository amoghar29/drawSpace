import { Router } from "express";
import {router} from "./auth" as authRouter;
import {userRouter} from "./user";

const router: Router = Router();    

router.post('/auth',authRouter);
router.post('/user',userRouter);

module.exports = router;