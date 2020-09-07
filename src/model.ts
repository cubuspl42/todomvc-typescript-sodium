import { Cell, Stream, StreamSlot, Unit } from "sodiumjs";
import { LazyGetter } from "lazy-get-decorator";
import "./sodiumjs";
import { NaArray, NaArrayChange, NaArrayLoop } from "./sodium-collections/array";

export class Todo {
	constructor(
		cCompleteAll: Stream<boolean>,
		text: string,
	) {
		this.sCompleteAll = cCompleteAll;
		this.text = this.sEdit.hold(text);
	}

	private readonly sCompleteAll: Stream<boolean>;

	readonly text: Cell<string>;

	readonly sComplete = new StreamSlot<boolean>();

	@LazyGetter()
	get cIsCompleted(): Cell<boolean> {
		return this.sCompleteAll.orElse(this.sComplete).hold(false);
	}

	@LazyGetter()
	get cIsActive(): Cell<boolean> {
		return this.cIsCompleted.map((c) => !c).calmRefEq();
	}

	readonly sDelete = new StreamSlot<Unit>();

	readonly sEdit = new StreamSlot<string>();
}

export class TodoList {
	private readonly _aTodos = new NaArrayLoop<Todo>();

	readonly sAddTodo = new StreamSlot<string>();

	readonly sToggleAll = new StreamSlot<Unit>()

	readonly sClearCompleted = new StreamSlot<Unit>();

	constructor() {
		const todo = (text: string) => new Todo(this.sCompleteAll, text);

		const aTodos = this._aTodos;

		const sAdd = this.sAddTodo;

		const sRemove: Stream<Map<number, Unit>> =
			aTodos.mergeMap((t) => t.sDelete);

		const sAddChange = sAdd.map((name) => {
			return aTodos.pushChange([
				todo(name),
			]);
		});

		const sRemoveChange = sRemove.map((m) =>
			new NaArrayChange<Todo>({
				deletes: new Set(m.keys()),
			})
		).orElse(this.sClearCompleted.map(() =>
			new NaArrayChange<Todo>({
				deletes: new Set(
					aTodos.cContent.sample()
						.flatMap((todo, index) =>
							todo.cIsCompleted.sample() ? [index] : [],
						),
				),
			})),
		);

		const aTodos_: NaArray<Todo> = NaArray.hold(
			[
				todo("Buy milk"),
				todo("Buy carrots"),
			],
			sAddChange.merge(sRemoveChange,
				(a, r) => a.union(r),
			),
		);

		this._aTodos.loop(aTodos_);

		this.aTodos.cContent.listen((todos) => console.log({ todos }));
	}

	@LazyGetter()
	get cAreAllTodosDone(): Cell<boolean> {
		return this.aTodos.every((todo) => todo.cIsCompleted).calmRefEq();
	}

	@LazyGetter()
	private get sCompleteAll(): Stream<boolean> {
		return this.sToggleAll
			.snapshot1(this.cAreAllTodosDone)
			.map((b) => !b);
	}


	get aTodos(): NaArrayLoop<Todo> {
		return this._aTodos;
	}

	private buildFilteredTodos(predicate: (todo: Todo) => Cell<boolean>): NaArray<Todo> {
		return this.aTodos.filterC(predicate);
	}

	@LazyGetter()
	get aCompletedTodos(): NaArray<Todo> {
		return this.buildFilteredTodos((todo) => todo.cIsCompleted.map((d) => d));
	}

	@LazyGetter()
	get aUncompletedTodos(): NaArray<Todo> {
		return this.buildFilteredTodos((todo) => todo.cIsCompleted.map((d) => !d));
	}
}
