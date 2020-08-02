import { NaDOM, NaElement } from "./sodium-dom/dom";
import { li } from "./sodium-dom/li";
import { div } from "./sodium-dom/div";
import { checkbox } from "./sodium-dom/checkbox";
import { label } from "./sodium-dom/label";
import { button } from "./sodium-dom/button";
import { textInput } from "./sodium-dom/textInput";

function todoElement(): NaElement {
	const todoCheckbox = checkbox({ className: "toggle" });
	const cCompleted = todoCheckbox.cChecked;
	const liClassName = cCompleted.map((c) => c ? "completed" : "");
	return li({ className: liClassName },
		div({ className: "view" },
			todoCheckbox,
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
