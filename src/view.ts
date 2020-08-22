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
import { Key } from "ts-keycode-enum";
import { Cell, lambda1, Operational, StreamLoop, Unit } from "sodiumjs";
import "./sodiumjs";
import { empty } from "./sodium-dom/emptyElement";
import { footer } from "./sodium-dom/footer";
import { span } from "./sodium-dom/span";
import { strong } from "./sodium-dom/strong";
import { link } from "./sodium-dom/a";
import { Todo, TodoList } from "./model";

export function todoAppElement(): NaElement {
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
						todoList.aTodos.map((todo) => todoElement(todo)),
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
						li([link({ className: "selected", href: "#/" }, ["All"])]),
						li([link({ href: "#/active" }, ["Active"])]),
						li([link({ href: "#/completed" }, ["Completed"])]),
					]),
					// Hidden if no completed items are left ↓
					todoList.aCompletedTodos.cLength.map((l) =>
						l > 0 ?
							clearCompletedButton :
							empty()
					),
				]) :
				empty(),
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
		initialChecked: todo.cIsDone.sample(),
		sSetChecked: Operational.updates(todo.cIsDone),
	});

	todo.sSetDone.connect(todoCheckbox.sChange);

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

	const liClassName = todo.cIsDone.lift(cEditing, (d, e) =>
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
