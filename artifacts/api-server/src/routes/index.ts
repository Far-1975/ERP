import { Router, type IRouter } from "express";
import healthRouter from "./health";
import mappingRouter from "./mapping";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/mapping", mappingRouter);

export default router;
