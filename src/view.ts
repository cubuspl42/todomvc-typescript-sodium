import { NaDOM, NaElement } from "./sodium-dom/dom";
import { li } from "./sodium-dom/elements/li";
import { div } from "./sodium-dom/elements/div";
import { checkbox } from "./sodium-dom/elements/checkbox";
import { label } from "./sodium-dom/elements/label";
import { button } from "./sodium-dom/elements/button";
import { textInput } from "./sodium-dom/elements/textInput";
import { ul } from "./sodium-dom/elements/ul";
import { section } from "./sodium-dom/elements/section";
import { header } from "./sodium-dom/elements/header";
import { h1 } from "./sodium-dom/elements/h1";
import { Key } from "ts-keycode-enum";
import { Cell, lambda1, Operational, StreamLoop, Unit } from "sodiumjs";
import "./sodiumjs";
import { empty } from "./sodium-dom/elements/emptyElement";
import { footer } from "./sodium-dom/elements/footer";
import { span } from "./sodium-dom/elements/span";
import { strong } from "./sodium-dom/elements/strong";
import { link, NaLinkElement } from "./sodium-dom/elements/link";
import { Todo, TodoList } from "./model";
import { Router } from "./sodium-dom/router";

export enum TodoFilter {
	all,
	active,
	completed,
}

export function todoAppElement(router: Router): NaElement {
	const todoList = new TodoList();

	const cAnyTodos = todoList.aTodos.cLength
		.map((l) => l > 0)
		.calmRefEq();

	const toggleAllCheckbox = checkbox({
		id: "toggle-all",
		className: "toggle-all",
		sSetChecked: Operational.updates(todoList.cAreAllTodosDone),
		initialChecked: todoList.cAreAllTodosDone.sample(),
	});

	todoList.sToggleAll.connect(toggleAllCheckbox.sChange);

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

	todoList.sAddTodo.connect(sAddTodo);

	const cUncompletedCount = todoList.aUncompletedTodos.cLength;

	const clearCompletedButton = button({ className: "clear-completed" }, ["Clear completed"]);

	todoList.sClearCompleted.connect(clearCompletedButton.sPressed);

	const cTodoFilter = router.dispatch({
		"/": () => TodoFilter.all,
		"/active": () => TodoFilter.active,
		"/completed": () => TodoFilter.completed,
	});

	const filterLink = (todoFilter: TodoFilter, href: string, text: string): NaLinkElement =>
		link({
			className: cTodoFilter
				.map((f) => f === todoFilter).calmRefEq()
				.map((s) => s ? "selected" : ""),
			href: href,
		}, [text]);

	const allLink = filterLink(TodoFilter.all, "#/", "All");
	const activeLink = filterLink(TodoFilter.active, "#/active", "Active");
	const completedLink = filterLink(TodoFilter.completed, "#/completed", "Completed");

	const filterTodo = (todo: Todo): Cell<boolean> =>
		cTodoFilter.flatMap(lambda1((f: TodoFilter) => {
			switch (f) {
				case TodoFilter.all:
					return new Cell(true);
				case TodoFilter.active:
					return todo.cIsActive;
				case TodoFilter.completed:
					return todo.cIsCompleted;
			}
		}, [todo.cIsActive, todo.cIsCompleted]));

	return section({ className: "todoapp" }, [
			header({ className: "header" }, [
				h1(["todos"]),
				newTodoInput,
			]),
			// This section should be hidden by default and shown when there are todos
			cAnyTodos.map((a) => a ?
				section({ className: "main" }, [
					toggleAllCheckbox,
					label({ htmlFor: "toggle-all" }, ["Mark all as complete"]),
					ul({ className: "todo-list" },
						todoList.aTodos
							.filterC(filterTodo)
							.map((todo) => todoElement(todo)),
					)
				]) :
				empty(),
			),
			// This footer should hidden by default and shown when there are todos
			cAnyTodos.map(lambda1((a) => a ?
				footer({ className: "footer" }, [
					// This should be `0 items left` by default
					span({ className: "todo-count" }, [
						strong([cUncompletedCount.map((n) => `${n}`)]),
						cUncompletedCount.map((n) => ` item${n === 1 ? '' : 's'} left`),
					]),
					// Remove this if you don't implement routing
					ul({ className: "filters" }, [
						li([allLink]),
						li([activeLink]),
						li([completedLink]),
					]),
					// Hidden if no completed items are left ↓
					todoList.aCompletedTodos.cLength.map((l) =>
						l > 0 ?
							clearCompletedButton :
							empty()
					),
				]) :
				empty(),
				// TODO: Implement composable vertices
				[cUncompletedCount],
			)),
		]
	);
}

// These are here just to show the structure of the list items
// List items should get the class `editing` when editing and `completed` when marked as completed
function todoElement(todo: Todo): NaElement {
	const todoCheckbox = checkbox({
		className: "toggle",
		initialChecked: todo.cIsCompleted.sample(),
		sSetChecked: Operational.updates(todo.cIsCompleted),
	});

	// TODO: Disconnect
	todo.sComplete.connect(todoCheckbox.sChange);

	const todoLabel = label([todo.text]);

	const deleteButton = button({ className: "destroy" });

	todo.sDelete.connect(deleteButton.sPressed);

	const sStartEditing = todoLabel.sDoubleClick;

	const todoTextEdit = textInput({
		className: "edit",
		initialText: "",
		sSubstituteText: sStartEditing.snapshot1(todo.text),
		sFocus: sStartEditing,
	});

	function idle(): Cell<boolean> {
		return Cell.switchC(sStartEditing.once().map(editing).hold(new Cell(false)));
	}

	const sSubmitEdit = todoTextEdit.sKeyDown.filter((k) => k === Key.Enter).mapTo(Unit.UNIT);

	const sEscDown = todoTextEdit.sKeyDown.filter((k) => k === Key.Escape).mapTo(Unit.UNIT);
	const sClickedOutside = NaDOM.body.sClick.filter((e) => {
		const target = e.target;
		if (target !== null) {
			return !todoTextEdit.contains(target);
		} else {
			return true;
		}
	}).mapTo(Unit.UNIT);
	const sAbortEdit = sEscDown.orElse(sClickedOutside);

	const sEndEditing = sSubmitEdit.orElse(sAbortEdit);

	function editing(): Cell<boolean> {
		return Cell.switchC(sEndEditing.once().map(idle).hold(new Cell(true)));
	}

	const cEditing = idle();

	todo.sEdit.connect(sSubmitEdit.snapshot1(todoTextEdit.cText));

	const liClassName = todo.cIsCompleted.lift(cEditing, (d, e) =>
		`${d ? "completed" : ""} ${e ? "editing" : ""}`,
	);

	return li({ className: liClassName }, [
		div({ className: "view" }, [
			todoCheckbox,
			todoLabel,
			deleteButton,
		]),
		todoTextEdit,
	]);
}
