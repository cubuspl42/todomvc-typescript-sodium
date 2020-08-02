import { NaDOM, NaElement } from "./sodium-dom/dom";
import { li } from "./sodium-dom/li";
import { div } from "./sodium-dom/div";
import { checkbox } from "./sodium-dom/checkbox";
import { label } from "./sodium-dom/label";
import { button } from "./sodium-dom/button";
import { textInput } from "./sodium-dom/textInput";
import { ul } from "./sodium-dom/ul";
import { section } from "./sodium-dom/section";
import { header } from "./sodium-dom/header";
import { h1 } from "./sodium-dom/h1";
import { footer } from "./sodium-dom/footer";
import { span } from "./sodium-dom/span";
import { strong } from "./sodium-dom/strong";
import { link } from "./sodium-dom/a";

function todoAppElement(): NaElement {
	return section({ className: "todoapp" },
		header({ className: "header" },
			h1("todos"),
			textInput({
				className: "new-todo",
				placeholder: "What needs to be done?",
				autofocus: true,
			}),
		),
		// This section should be hidden by default and shown when there are todos
		section({ className: "main" },
			checkbox({ id: "toggle-all", className: "toggle-all" }),
			label({ htmlFor: "toggle-all" }, "Mark all as complete"),
			todoListElement(),
		),
		// This footer should hidden by default and shown when there are todos
		footer({ className: "footer" },
			// This should be `0 items left` by default
			span({ className: "todo-count" },
				strong("0"), " item left",
			),
			// Remove this if you don't implement routing
			ul({ className: "filters" },
				li(link({ className: "selected", href: "#/" }, "All")),
				li(link({ href: "#/active" }, "Active")),
				li(link({ href: "#/completed" }, "Completed")),
			),
			// Hidden if no completed items are left ↓
			button({ className: "clear-completed" }, "Clear completed"),
		)
	);
}

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
	todoAppElement,
	document.body,
);
