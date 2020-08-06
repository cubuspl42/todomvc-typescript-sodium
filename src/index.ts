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
import { Key } from "ts-keycode-enum";
import { Cell, CellLoop, Operational, Stream, StreamLoop, Unit } from "sodiumjs";
import { LazyGetter } from "lazy-get-decorator";
import "./sodiumjs";

class Todo {
	constructor(
		readonly text: string,
	) {
	}

	readonly sSetDone = new StreamLoop<boolean>();

	readonly cIsDone = this.sSetDone.hold(false);

	readonly sDelete = new StreamLoop<Unit>();
}

class TodoList {
	readonly sAddTodo = new StreamLoop<string>();

	@LazyGetter()
	get cTodos(): Cell<ReadonlyArray<Todo>> {
		const cTodosLoop = new CellLoop<ReadonlyArray<Todo>>();

		const sTodosAfterAdd = this.sAddTodo.snapshot(cTodosLoop,
			(newTodoText, todos) =>
				[...todos, new Todo(newTodoText)]
		);

		const sDeleteTodos = Cell.switchS(
			cTodosLoop.map((todos) =>
				Stream.mergeSet(
					new Set(todos.map((todo) => todo.sDelete.mapTo(todo))),
				),
			),
		);

		const sTodosAfterDelete = sDeleteTodos.snapshot(cTodosLoop,
			(todosToRemove, todos) =>
				todos.filter((todo) => !todosToRemove.has(todo)),
		);

		const cTodos_ = sTodosAfterAdd.orElse(sTodosAfterDelete).hold([
			new Todo("Buy a unicorn"),
			new Todo("Taste JavaScript"),
			new Todo("Taste JavaScript (really)!"),
		]);

		cTodosLoop.loop(cTodos_);

		return cTodos_;
	}
}

function todoAppElement(): NaElement {
	const todoList = new TodoList();

	const sClearNewTodoInput = new StreamLoop<Unit>();

	const newTodoInput = textInput({
		className: "new-todo",
		sSubstituteText: sClearNewTodoInput.mapTo(""),
		placeholder: "What needs to be done?",
		autofocus: true,
	});

	const sAddTodo = newTodoInput.sKeyDown
		.filter((k) => k === Key.Enter)
		.snapshot1(newTodoInput.cText)
		.filter((n) => n.length > 0);

	sClearNewTodoInput.loop(sAddTodo);

	todoList.sAddTodo.loop(sAddTodo);

	return section({ className: "todoapp" }, [
		header({ className: "header" }, [
			h1(["todos"]),
			newTodoInput,
		]),
		// This section should be hidden by default and shown when there are todos
		section({ className: "main" }, [
			checkbox({ id: "toggle-all", className: "toggle-all" }),
			label({ htmlFor: "toggle-all" }, "Mark all as complete"),
			ul({ className: "todo-list" },
				todoList.cTodos.map((todos) =>
					todos.map((todo) => todoElement(todo)),
				),
			)
		]),
		// This footer should hidden by default and shown when there are todos
		footer({ className: "footer" }, [
			// This should be `0 items left` by default
			span({ className: "todo-count" },
				[strong(["0"]), " item left",]
			),
			// Remove this if you don't implement routing
			ul({ className: "filters" }, [
				li([link({ className: "selected", href: "#/" }, "All")]),
				li([link({ href: "#/active" }, "Active")]),
				li([link({ href: "#/completed" }, "Completed")]),
			]),
			// Hidden if no completed items are left ↓
			button({ className: "clear-completed" }, "Clear completed"),
		])]
	);
}

// These are here just to show the structure of the list items
// List items should get the class `editing` when editing and `completed` when marked as completed
function todoElement(todo: Todo): NaElement {
	const todoCheckbox = checkbox({
		initialChecked: todo.cIsDone.sample(),
		className: "toggle"
	});

	todo.sSetDone.loop(Operational.updates(todoCheckbox.cChecked));

	const liClassName = todo.cIsDone.map((d) => d ? "completed" : "");
	const deleteButton = button({ className: "destroy" });

	todo.sDelete.loop(deleteButton.sPressed);

	return li({ className: liClassName }, [
		div({ className: "view" }, [
			todoCheckbox,
			label(todo.text),
			deleteButton,
		]),
		textInput({ className: "edit", initialText: "Create a TodoMVC template" }),
	]);
}

NaDOM.render(
	todoAppElement,
	document.body,
);
