import { NaDOM } from "./sodium-dom/dom";
import "./sodiumjs";
import { todoAppElement } from "./view";
import { Router } from "./sodium-dom/router";

const router = new Router();

NaDOM.render(
	() => todoAppElement(router),
	document.body,
);

// showGraph();
