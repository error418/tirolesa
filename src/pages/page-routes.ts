"use strict";

import { Router, Request, Response, NextFunction } from "express";
import * as express from "express";

class PageRoutes {

	public getRoute(): Router {
		const router = Router();

		// set locals for all pages
		router.use("/", (req: Request, res: Response, next: NextFunction) => {
			res.locals.appPublicPage = null;
			next();
		});

		// index page route
		router.get("/", (req: Request, res: Response) => {
			res.render("index", {

			});
		});

		router.use("/static", express.static("static"));

		return router;
	}

}

export default PageRoutes;