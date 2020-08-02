import { NaDOM, NaElement } from "./sodium-dom/dom";
import { li } from "./sodium-dom/li";
import { div } from "./sodium-dom/div";
import { checkbox } from "./sodium-dom/checkbox";
import { label } from "./sodium-dom/label";
import { button } from "./sodium-dom/button";
import { textInput } from "./sodium-dom/textInput";

function todoElement(): NaElement {
	return li({ className: "completed" },
		div({ className: "view" },
			checkbox({ className: "toggle" }),
			label("Taste JavaScript (really)!"),
			button({ className: "destroy" }),
		),
		textInput({ className: "edit", initialText: "Create a TodoMVC template" }),
	);
}

NaDOM.render(
	todoElement,
	document.getElementById("todo-list")!,
);
