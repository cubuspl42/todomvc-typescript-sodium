import { NaDOM, NaElement } from "./sodium-dom/dom";
import { li } from "./sodium-dom/li";
import { div } from "./sodium-dom/div";
import { checkbox } from "./sodium-dom/checkbox";
import { label } from "./sodium-dom/label";
import { button } from "./sodium-dom/button";
import { textInput } from "./sodium-dom/textInput";
import { ul } from "./sodium-dom/ul";

function todoListElement(): NaElement {
	return ul({ className: "todo-list" },
		...["Buy a unicorn", "Taste JavaScript", "Taste JavaScript (really)!"].map(
			(l) => todoElement(l),
		),
	);
}

// These are here just to show the structure of the list items
// List items should get the class `editing` when editing and `completed` when marked as completed
function todoElement(labelText: string): NaElement {
	const todoCheckbox = checkbox({ className: "toggle" });
	const cCompleted = todoCheckbox.cChecked;
	const liClassName = cCompleted.map((c) => c ? "completed" : "");
	return li({ className: liClassName },
		div({ className: "view" },
			todoCheckbox,
			label(labelText),
			button({ className: "destroy" }),
		),
		textInput({ className: "edit", initialText: "Create a TodoMVC template" }),
	);
}

NaDOM.render(
	todoListElement,
	document.getElementById("root")!,
);
